import * as chalk from "chalk";
import * as prettier from "prettier";

import { readFile, readJson, remove, writeFile } from "fs-extra";

import { resolve } from "path";

function path(rel: string): string {
    return resolve(__dirname, rel);
}

export async function hooks(): Promise<void> {
    const prettierConfig = await readFile(path("../.prettierrc.js"), { encoding: "utf8" });
    const prettierOptions = await prettier.resolveConfig(prettierConfig);
    const pkg = await readJson(path("../package.json"));
    delete pkg.husky;
    delete pkg["lint-staged"];
    await writeFile(
        path("../package.json"),
        prettier.format(JSON.stringify(pkg), Object.assign({ parser: "json" }, prettierOptions)),
    );
    console.log(`🗑️  ${chalk.green("Disabled Git hooks integration")}`);
}

export async function dependabot(): Promise<void> {
    await remove(path("../.dependabot"));
    console.log(`🗑️  ${chalk.green("Disabled Dependabot integration")}`);
}

export async function vscode(): Promise<void> {
    await remove(path("../.vscode"));
    console.log(`🗑️  ${chalk.green("Disabled VSCode integration")}`);
}

if (process.argv.includes("hooks")) {
    hooks();
}

if (process.argv.includes("dependabot")) {
    dependabot();
}

if (process.argv.includes("vscode")) {
    vscode();
}
