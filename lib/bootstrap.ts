import * as chalk from "chalk";
import * as inquirer from "inquirer";
import * as prettier from "prettier";

import { emptyDir, pathExists, readFile, readJson, writeFile } from "fs-extra";

import { exec } from "child-process-promise";
import { resolve } from "path";

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

async function updatePackage(): Promise<void> {
    console.log(`📦 ${chalk.green("Update package.json with your project settings:")}`);
    const pkg = await readJson(path("../package.json"));
    if (pkg.name !== "aws-cdk-stack-factory") {
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
    let repoDefault = "";
    try {
        remote = await run("git config --get remote.origin.url");
        if (remote.startsWith("git@github.com:")) {
            repoDefault = `https://github.com/${remote.replace("git@github.com:", "").trim()}`;
        }
    } catch {}
    const { REPO_URL } = await inquirer.prompt([
        {
            type: "input",
            name: "REPO_URL",
            message: "repo url:",
            default: repoDefault,
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
    const prettierConfig = await readFile(path("../.prettierrc.js"), { encoding: "utf8" });
    const prettierOptions = await prettier.resolveConfig(prettierConfig);
    await writeFile(
        path("../package2.json"),
        prettier.format(JSON.stringify(pkg), Object.assign({ parser: "json" }, prettierOptions)),
    );
}

export async function cleanDemoFiles(): Promise<void> {
    await emptyDir(path("../envs"));
    await emptyDir(path("../src/stacks"));
    await emptyDir(path("../src/constructs"));
    await emptyDir(path("../tests"));
    console.log(`🗑️ ${chalk.green("Deleted demo envs, stacks, construsts and tests")}`);
}

export async function profile(): Promise<void> {
    await makeProfile();
}

export async function init(): Promise<void> {
    await makeProfile();
    await updatePackage();
    await cleanDemoFiles();
}

if (process.argv.includes("profile")) {
    profile();
}

if (process.argv.includes("init")) {
    init();
}
