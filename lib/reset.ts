import * as chalk from "chalk";
import * as inquirer from "inquirer";

import { exec } from "child-process-promise";
import { readJson } from "fs-extra";
import { resolve } from "path";

function path(rel: string): string {
    return resolve(__dirname, rel);
}

async function run(cmd: string): Promise<string> {
    const ret = await exec(cmd);
    return ret.stdout;
}

async function main(): Promise<void> {
    console.log(`📦 ${chalk.green("Update package.json with your project setting:")}`);
    const pkg = await readJson(path("../package.json"));
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
    console.log(pkg);
    //await emptyDir(path("../envs"));
    //await emptyDir(path("../src/stacks"));
    //await emptyDir(path("../src/constructs"));
    //await emptyDir(path("../tests"));
}

main();
