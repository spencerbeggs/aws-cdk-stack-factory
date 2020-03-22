# Building and Testing Constructs

Using CDK can give you confidence that you are outputing CloudFormation templates that have the correct API. But when you are creating more elaborate stacks or polymorphic constructs, it is helpful to perform unit testing to determine that the resulting template will be configured the way you expect them to be. Breaking your stack into individual constructs and running unit tests on each piece will help you develop faster and save time and money spinning up and tearing down stacks over and over again.

This repo contains a Typescript-compatible [Jest](https://jestjs.io/) setup that can be used with the [@aws-cdk/asset](https://www.npmjs.com/package/@aws-cdk/assert) module. Place your tests inside the `tests` folder and name your test files like `my-construct.test.ts` or `my-construct.spec.ts`.

To run the test suite: `yarn test`

## Test Exammple

Let's create a basic construct that creates a t2.nano EC2 instance in either private or public subnets of a VPC that's id is passed as a prop to the constuct. We would create the file `src/constructs/micro-instance.ts`:

```typescript
import {
    AmazonLinuxImage,
    Instance,
    InstanceClass,
    InstanceSize,
    InstanceType,
    SubnetType,
    Vpc,
} from "@aws-cdk/aws-ec2";

import { Construct } from "@aws-cdk/core";

interface MicroInstanceProps {
    vpcId: string;
    private?: boolean;
}

export class MicroInstance extends Construct {
    public readonly instance: Instance;
    public constructor(scope: Construct, id: string, props: MicroInstanceProps) {
        super(scope, id);
        const vpc = Vpc.fromLookup(this, "VPC", {
            vpcId: props.vpcId,
        });
        this.instance = new Instance(this, "MicroInstance", {
            vpc,
            machineImage: new AmazonLinuxImage(),
            instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.NANO),
            vpcSubnets: {
                subnetType: props.private ? SubnetType.PRIVATE : SubnetType.PUBLIC,
            },
        });
    }
}
```

To test all the possible permutations our our constuct we can create a test file `tests/micro-instance.test.ts`:

```typescript
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
```
