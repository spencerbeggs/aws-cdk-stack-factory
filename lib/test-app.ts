import { App, Stack } from "@aws-cdk/core";

export class TestApp {
    public readonly stack: Stack;
    private readonly app: App;
    constructor() {
        const account = "123456789012";
        const region = "us-east";
        const context = {
            [`availability-zones:${account}:${region}`]: `${region}-1a`,
        };
        this.app = new App({ context });
        this.stack = new Stack(this.app, "TestStack", { env: { account, region } });
    }
}
