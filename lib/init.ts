#!/usr/bin/env node
require("dotenv").config();

import "source-map-support/register";

import * as process from "process";

import { APP_ENV, STACK } from "./env";

import { Tag } from "@aws-cdk/core";

const hasEnv = !["default", undefined].includes(APP_ENV);
const STACK_NAME = hasEnv ? `${STACK}-${APP_ENV}` : STACK;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TargetStack } = require(`../src/stacks/${STACK}`);

import cdk = require("@aws-cdk/core");

const app = new cdk.App();
const stack = new TargetStack(app, STACK_NAME, {
    env: {
        account: process.env.AWS_ACCOUNT_ID,
        region: process.env.AWS_REGION,
    },
});
Tag.add(stack, "app", STACK);
Tag.add(stack, "env", hasEnv ? APP_ENV : "production");
