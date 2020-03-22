import { App, Stack } from "@aws-cdk/core";
import { countResources, expect as expectCDK } from "@aws-cdk/assert";

import { TargetStack } from "../stacks/single-stack";
// TestApp is a helper class that creates a mock app provided by this repo
import { TestApp } from "../test-app";

describe("MyStack", (): void => {
    let app: App;
    let stack: Stack;
    let fn: Function;
    beforeEach(() => {
        // Before each test we are going to create a new mock app for our stack
        // and generate a new test stack, it is wrapped in a lambda function
        // to ensure the stack synthesize function doesn't throw
        ({ app } = new TestApp());
        fn = (): void => {
            stack = new TargetStack(app, "MyStack");
        };
    });
    it("the stack synthesizes", function(): void {
        // You must expect on the wrapper function before stack is available for inspection
        expect(fn).not.toThrow();
        // Now you can examine the resulting stack
        expectCDK(stack).to(countResources("*", 0));
    });
});
