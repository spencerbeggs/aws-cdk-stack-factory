import { App, Stack } from "@aws-cdk/core";

export class TestApp {
    public readonly stack: Stack;
    public readonly app: App;
    constructor(region = "us-east-1") {
        const account = "1234567890";
        const context = {
            [`availability-zones:${account}:${region}`]: `${region}a`,
        };
        this.app = new App({ context });
        this.stack = new Stack(this.app, "TestStack", { env: { account, region } });
    }
}
