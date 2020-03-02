import * as fs from "fs-extra";
import * as inquirer from "inquirer";

import { resolve } from "path";

async function main(): Promise<void> {
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
    await fs.writeFile(resolve(__dirname, "../.env"), envFile);
}

main();
