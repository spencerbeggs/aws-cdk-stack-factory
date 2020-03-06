import * as chalk from "chalk";
import * as inquirer from "inquirer";

import { pathExists, writeFile } from "fs-extra";

import { resolve } from "path";

function path(rel: string): string {
    return resolve(__dirname, rel);
}

export async function makeProfile(): Promise<void> {
    console.log(`🔑 ${chalk.green("Setup your AWS credentials in an untracked .env file:")}`);
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
            process.exit();
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
}

makeProfile();
