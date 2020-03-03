import { countResources, expect as expectCDK, haveResource } from "@aws-cdk/assert";

import { AsyncRoutes } from "../src/constructs/async-routes";
import { Stack } from "@aws-cdk/core";
// TestApp is a helper class that creates a mock app provided by this repo
import { TestApp } from "../lib/test-app";

jest.mock("aws-sdk", function() {
    return {
        IAM: function(): object {
            return {
                getGroup: (): object => ({
                    promise: (): Promise<object> =>
                        Promise.resolve({
                            Users: [
                                {
                                    Username: "foo",
                                },
                                {
                                    Username: "bar",
                                },
                                {
                                    Username: "baz",
                                },
                            ],
                        }),
                }),
            };
        },
    };
});

describe("AsyncRoutes", (): void => {
    let stack: Stack;
    beforeEach(() => {
        // Before each test we are going to create a new mock stack
        ({ stack } = new TestApp());
    });
    it("creates A records from an array returned by an external API", () => {
        const usernames = ["foo", "bar", "baz"];
        new AsyncRoutes(stack, "AsyncRecords", {
            group: "foobar",
            zoneName: "example.com",
        });
        expectCDK(stack).to(countResources("AWS::Route53::RecordSet", 3));
        usernames.forEach(username => {
            expectCDK(stack).to(
                haveResource("AWS::Route53::RecordSet", {
                    Name: `${username}.example.com.`,
                }),
            );
        });
    });
});
