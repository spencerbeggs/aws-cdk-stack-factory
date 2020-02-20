require("dotenv").config();

import * as chalk from "chalk";
import * as fs from "fs-extra";
import * as path from "path";
import * as process from "process";

import { spawn } from "child_process";

function throwErr(message: string): void {
    console.log("☠️ ", chalk.red(message));
    process.exit(0);
}

function init(command: string): Promise<void> {
    if (command === "exit") {
        return Promise.reject("Invalid lifecycle script specified. See package.json for valid commands.");
    } else {
        return new Promise((resolve, reject): void => {
            const deploy = spawn("cdk", [command, "--profile", process.env.AWS_PROFILE, "--output", ".cdk"], {
                shell: true,
                stdio: "inherit",
            });

            deploy.on("close", (code): void => {
                if (code === 0) {
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }
}

async function createConfig(stack: string, env: string): Promise<void> {
    const config = env ? await fs.readJSON(path.resolve(__dirname, `../envs/${stack}/${env}.json`)) : {};
    let app = env ? `APP_ENV=${env} ` : "";
    app += `STACK=${stack} npx ts-node lib/init.ts --output .cdk`;
    return fs.writeJSON(
        path.resolve(__dirname, "../cdk.json"),
        {
            app,
            requireApproval: "never",
            context: config,
        },
        {
            spaces: "\t",
        },
    );
}

async function main(): Promise<void> {
    try {
        let COMMAND = process.env.npm_lifecycle_event || "exit";
        if (COMMAND === "push") {
            COMMAND = "deploy";
        }
        const STACK = process.argv[2];
        let APP_ENV = process.argv[3];
        if (!STACK) {
            throwErr("You must pass the stack name as the first argument, eg: yarn push media");
        }
        const stackFileExists = await fs.pathExists(path.resolve(__dirname, `../src/stacks/${STACK}.ts`));
        if (!stackFileExists) {
            throwErr(`No stack definition file found at: src/stacks/${STACK}.ts`);
        }
        if (APP_ENV) {
            const stackConfigFileExists = await fs.pathExists(
                path.resolve(__dirname, `../envs/${STACK}/${APP_ENV}.json`),
            );
            if (!stackConfigFileExists) {
                throwErr(`No stack config file found at: envs/${STACK}/${APP_ENV}.json`);
            }
        } else {
            const defaultStackConfigFileExists = await fs.pathExists(
                path.resolve(__dirname, `../envs/${STACK}/default.json`),
            );
            if (defaultStackConfigFileExists) {
                APP_ENV = "default";
            }
        }

        await createConfig(STACK, APP_ENV);
        await init(COMMAND);
    } catch (err) {
        console.log(err);
    }
}

main();
