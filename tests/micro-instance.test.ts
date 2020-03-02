import { expect as expectCDK, haveResource } from "@aws-cdk/assert";

import { MicroInstance } from "../src/constructs/micro-instance";
import { Stack } from "@aws-cdk/core";
// TestApp is a helper class that creates a mock app provided by this repo
import { TestApp } from "../lib/test-app";

describe("MicroInstance", (): void => {
    let stack: Stack;
    beforeEach(() => {
        // Before each test we are going to create a new mock stack
        ({ stack } = new TestApp());
    });
    it("builds an instance in a VPC's public subnets by default", function(): void {
        // Here we add an instance of our Constuct to the mock stack
        new MicroInstance(stack, "MictoInstanceTest", {
            // the vpcId doesn't matter here
            vpcId: "12345",
        });
        // When you use Vpc.fromLookUp method a dummy object is return in testing
        // the ID of the public subnet is in the format s-12344
        // that's not documented very well, unfortunatly
        expectCDK(stack).to(haveResource("AWS::EC2::Instance", { SubnetId: "s-12345" }));
    });
    it("builds an instance in a VPC's private subnets if MicroInstanceProps.private is true", function(): void {
        // Here we add an instance of our Construct with a different configuration to another mock stack
        new MicroInstance(stack, "MictoInstanceTest", {
            vpcId: "12345",
            private: true,
        });
        // The private subnet is formatted with p-12345
        expectCDK(stack).to(haveResource("AWS::EC2::Instance", { SubnetId: "p-12345" }));
    });
});
