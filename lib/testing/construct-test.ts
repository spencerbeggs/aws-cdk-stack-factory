import { countResources, expect as expectCDK } from "@aws-cdk/assert";

import { MyConstruct } from "../constructs/imported-construct";
import { Stack } from "@aws-cdk/core";
// TestApp is a helper class that creates a mock app provided by this repo
import { TestApp } from "../../lib/test-app";

describe("MyConstruct", (): void => {
    let stack: Stack;
    let fn: Function;

    beforeEach(() => {
        // Before each test we are going to create a new mock stack
        fn = (): void => {
            ({ stack } = new TestApp());
        };
    });
    it("the construct synthesizes", () => {
        // add your construct to the stack
        new MyConstruct(stack, "MyConstruct", {});
        // You must expect on the wrapper function before stack is available for inspection
        expect(fn).not.toThrow();
        // Nowt you can examine the resulting stack
        expectCDK(stack).to(countResources("*", 0));
    });
});
