import * as chalk from "chalk";
import * as inquirer from "inquirer";
import * as prettier from "prettier";

import { emptyDir, pathExists, readFile, readJson, remove, writeFile } from "fs-extra";

import { exec } from "child-process-promise";
import { paramCase } from "change-case";
import { resolve } from "path";

const STACK_ONLY = "STACK_ONLY";
const STACK_WITH_CONSTRUCT = "STACK_WITH_CONSTRUCT";

function path(rel: string): string {
    return resolve(__dirname, rel);
}

async function run(cmd: string): Promise<string> {
    const ret = await exec(cmd);
    return ret.stdout;
}

export async function makeProfile(): Promise<boolean> {
    console.log(`🔑 ${chalk.green("Setup your AWS info in an untracked .env file:")}`);
    const hasEnv = await pathExists(path("../.env"));
    if (hasEnv) {
        const { OVERWRITE_ENV } = await inquirer.prompt([
            {
                type: "confirm",
                name: "OVERWRITE_ENV",
                message: "Overwrite your current .env file?",
                default: false,
            },
        ]);
        if (!OVERWRITE_ENV) {
            return false;
        }
    }
    const { AWS_PROFILE, AWS_ACCOUNT_ID, AWS_REGION } = await inquirer.prompt([
        { type: "input", name: "AWS_PROFILE", message: "AWS_PROFILE:" },
        { type: "input", name: "AWS_ACCOUNT_ID", message: "AWS_ACCOUNT_ID:" },
        { type: "input", name: "AWS_REGION", message: "AWS_REGION:", default: "us-east-1" },
    ]);
    const envFile = `
    AWS_PROFILE=${AWS_PROFILE}
    AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
    AWS_REGION=${AWS_REGION}
    `
        .trimLeft()
        .split("\n")
        .map(line => line.trim())
        .join("\n");
    await writeFile(path("../.env"), envFile);
    return true;
}

interface PackageReturn {
    name: string;
    bypass: boolean;
}

async function updatePackage(): Promise<PackageReturn> {
    console.log(`📦  ${chalk.green("Update package.json with your project settings:")}`);
    const pkg = await readJson(path("../package.json"));
    if (pkg.name !== "aws-cdk-stack-factory") {
        console.log(`⚠️  ${chalk.yellow("Project has already been intialized.")}`);
        const { OVERWRITE } = await inquirer.prompt([
            {
                type: "confirm",
                name: "OVERWRITE",
                default: false,
                message: "Overwrite project?",
            },
        ]);
        if (!OVERWRITE) {
            return {
                name: pkg.name,
                bypass: true,
            };
        }
    }
    const { NAME, DESCRIPTION, VERSION } = await inquirer.prompt([
        { type: "input", name: "NAME", message: "name:", default: "my-stack" },
        { type: "input", name: "DESCRIPTION", message: "description:", default: "" },
        { type: "input", name: "VERSION", message: "version:", default: "0.0.0" },
    ]);
    pkg.name = NAME;
    if (DESCRIPTION) {
        pkg.description = DESCRIPTION;
    } else {
        delete pkg.description;
    }
    pkg.version = VERSION;
    let remote = null;
    try {
        remote = await run("git config --get remote.origin.url");
        if (remote.startsWith("git@github.com:")) {
            remote = `https://github.com/${remote.replace("git@github.com:", "").trim()}`;
        }
    } catch {}
    const { REPO_URL } = await inquirer.prompt([
        {
            type: "input",
            name: "REPO_URL",
            message: "repo url:",
            default: remote,
        },
    ]);
    if (REPO_URL) {
        pkg.repository.url = REPO_URL;
    } else {
        delete pkg.repository;
    }
    let authorDefault = "";
    try {
        const authorName = await run("git config user.name");
        authorDefault = authorName.trim();
    } catch {}
    try {
        let authorEmail = await run("git config user.email");
        authorEmail = authorEmail.trim();
        if (!authorDefault) {
            authorDefault = authorEmail;
        } else {
            authorDefault = `${authorDefault} <${authorEmail}>`;
        }
    } catch {}
    const { AUTHOR } = await inquirer.prompt([
        {
            type: "input",
            name: "AUTHOR",
            message: "author",
            default: authorDefault,
        },
    ]);
    if (AUTHOR) {
        pkg.author = AUTHOR;
    } else {
        delete pkg.author;
    }
    const { USE_DEPENDABOT } = await inquirer.prompt([
        {
            type: "confirm",
            name: "USE_DEPENDABOT",
            message: "Use Dependabot integration?",
            default: true,
        },
    ]);
    if (USE_DEPENDABOT) {
        const { DEPENDABOT_BRANCH } = await inquirer.prompt([
            {
                type: "input",
                name: "DEPENDABOT_BRANCH",
                message: "Dependabot branch to track?",
                default: "master",
            },
        ]);
        const dependabotConfigFileData = await readFile(path("../.dependabot/config.yml"));
        await writeFile(
            path("../.dependabot/config.yml"),
            dependabotConfigFileData
                .toString()
                .replace(/target_branch: develop/g, `target_branch: ${DEPENDABOT_BRANCH}`),
        );
    } else {
        await remove(path("../.dependabot"));
    }
    const { USE_GIT_HOOKS } = await inquirer.prompt([
        {
            type: "confirm",
            name: "USE_GIT_HOOKS",
            message: "Use Git commit hooks?",
            default: true,
        },
    ]);
    if (!USE_GIT_HOOKS) {
        delete pkg.husky;
        delete pkg["lint-staged"];
    }
    const prettierConfig = await readFile(path("../.prettierrc.js"), { encoding: "utf8" });
    const prettierOptions = await prettier.resolveConfig(prettierConfig);
    await writeFile(
        path("../package.json"),
        prettier.format(JSON.stringify(pkg), Object.assign({ parser: "json" }, prettierOptions)),
    );
    return {
        name: pkg.name,
        bypass: false,
    };
}

export async function cleanDemoFiles(bypass = false): Promise<void> {
    if (!bypass) {
        await emptyDir(path("../envs"));
        await emptyDir(path("../src/stacks"));
        await emptyDir(path("../src/constructs"));
        await emptyDir(path("../tests"));
        console.log(`🗑️  ${chalk.green("Deleted demo envs, stacks, constructs and tests")}`);
    }
}

export async function addInitFiles(bypass = false): Promise<void> {
    if (!bypass) {
        const { ADD_INIT_FILES } = await inquirer.prompt([
            {
                type: "list",
                message: "Bootstrap stack, construct and test files?",
                name: "ADD_INIT_FILES",
                default: STACK_WITH_CONSTRUCT,
                choices: [
                    {
                        name: "Stack with imported constuct with test",
                        value: STACK_WITH_CONSTRUCT,
                    },
                    {
                        name: "Stack with test",
                        value: STACK_ONLY,
                    },
                    {
                        name: "Empty repo",
                        value: null,
                    },
                ],
            },
        ]);
        if (ADD_INIT_FILES) {
            const TEST_APP_REPLACE_PATH = "../test-app";
            const TEST_APP_PATH = "../lib/test-app";
            const { STACK_FILENAME } = await inquirer.prompt([
                {
                    type: "input",
                    name: "STACK_FILENAME",
                    default: "my-stack",
                    message: "Stack filename (use kebab-case-style, no extention):",
                    validate: (input: string): boolean => /^([a-z][a-z0-9]*)(-[a-z0-9]+)*$/.test(input),
                },
            ]);
            const STACK_FILE_PATH = `../src/stacks/${STACK_FILENAME}`;
            if (ADD_INIT_FILES === STACK_ONLY) {
                const stackFileData = await readFile(path("./stacks/single-stack.ts"));
                await writeFile(path(`${STACK_FILE_PATH}.ts`), stackFileData);
            }
            if (ADD_INIT_FILES === STACK_WITH_CONSTRUCT) {
                const stackFileData = await readFile(path("./stacks/stack-with-construct.ts"));
                const constructFileData = await readFile(path("./constructs/imported-construct.ts"));
                const stackTestFileData = await readFile(path("./testing/stack-test.ts"));
                const { CONSTRUCT_NAME } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "CONSTRUCT_NAME",
                        default: "MyConstruct",
                        message: "Construct name (use PascalCase):",
                        validate: (input: string): boolean => /^[A-Z][a-z]+(?:[A-Z][a-z]+)*$/.test(input),
                    },
                ]);
                const CONSTRUCT_FILE_NAME = paramCase(CONSTRUCT_NAME);
                const CONSTRUCT_FILE_PATH = `../src/constructs/${CONSTRUCT_FILE_NAME}`;
                await writeFile(
                    path(`${STACK_FILE_PATH}.ts`),
                    stackFileData
                        .toString()
                        .replace(/MyConstruct/g, CONSTRUCT_NAME)
                        .replace("../constructs/imported-construct", `../constructs/${CONSTRUCT_FILE_NAME}`),
                );
                await writeFile(
                    path(`${CONSTRUCT_FILE_PATH}.ts`),
                    constructFileData.toString().replace(/MyConstruct/g, CONSTRUCT_NAME),
                );
                await writeFile(
                    path(`../tests/${CONSTRUCT_FILE_NAME}.construct.test.ts`),
                    stackTestFileData
                        .toString()
                        .replace("../stacks/single-stack", STACK_FILE_PATH)
                        .replace(TEST_APP_REPLACE_PATH, TEST_APP_PATH),
                );
            }
            const stackTestFileData = await readFile(path("./testing/stack-test.ts"));
            await writeFile(
                path(`../tests/${STACK_FILENAME}.stack.test.ts`),
                stackTestFileData
                    .toString()
                    .replace("../stacks/single-stack", STACK_FILE_PATH)
                    .replace(TEST_APP_REPLACE_PATH, TEST_APP_PATH),
            );
        }
        console.log(`🧬  ${chalk.green("Added stack, constuct and test stubs")}`);
    }
}

export async function writeDocs(bypass: boolean, name: string): Promise<void> {
    if (!bypass) {
        const readmeFileData = await readFile(path("./docs/ROOT_README.md"));
        await writeFile(path("../README.md"), readmeFileData.toString().replace("aws-cdk-stack-factory", name));
        console.log(`📄  ${chalk.green("Updated root README")}`);
    }
}

export async function profile(): Promise<void> {
    await makeProfile();
}

export async function init(): Promise<void> {
    await makeProfile();
    const { bypass, name } = await updatePackage();
    await cleanDemoFiles(bypass);
    await addInitFiles(bypass);
    await writeDocs(bypass, name);
}

if (process.argv.includes("profile")) {
    profile();
}

if (process.argv.includes("init")) {
    init();
}

if (process.argv.includes("files")) {
    addInitFiles();
}
