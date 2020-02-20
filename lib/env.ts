import * as process from "process";

const { APP_ENV: appEnv, STACK: stackName } = process.env;
export const APP_ENV = appEnv;
export const STACK = stackName;
