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
    const { NAME, DESCRIPTION, VERSION } = await inquirer.prompt([
        { type: "input", name: "NAME", message: "name:", default: "my-stack" },
        { type: "input", name: "DESCRIPTION", message: "description:", default: "" },
        { type: "input", name: "VERSION", message: "version:", default: "0.0.0" },
    ]);
    const remote = await run("git config --get remote.origin.url");
    console.log(remote);
    const pkg = await readJson(path("../package.json"));
    pkg.name = NAME;
    if (DESCRIPTION) {
        pkg.description = DESCRIPTION;
    } else {
        delete pkg.description;
    }
    pkg.version = VERSION;
    pkg.repository.url = `https://github.com/${remote.replace("git@github.com:", "").trim()}`;
    console.log(pkg);
    //await emptyDir(path("../envs"));
    //await emptyDir(path("../src/stacks"));
    //await emptyDir(path("../src/constructs"));
    //await emptyDir(path("../tests"));
}

main();
