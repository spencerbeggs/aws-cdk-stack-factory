#!/usr/bin/env node
require("dotenv").config();

import "source-map-support/register";

import * as process from "process";

import { APP_ENV, STACK } from "./env";

const STACK_NAME = ["default", undefined].includes(APP_ENV) ? STACK : `${STACK}-${APP_ENV}`;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TargetStack } = require(`../src/stacks/${STACK}`);

import cdk = require("@aws-cdk/core");

const app = new cdk.App();
new TargetStack(app, STACK_NAME, {
    env: {
        account: process.env.AWS_ACCOUNT_ID,
        region: process.env.AWS_REGION,
    },
});
