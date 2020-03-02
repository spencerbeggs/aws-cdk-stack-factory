# AWS CDK Stack Factory 🏭

This repo is boilerplate template for building, testing and deploying [AWS Cloud Development Kit](https://docs.aws.amazon.com/cdk/latest/guide/home.html) stacks and constructs in [Typescript](https://www.typescriptlang.org/). It works by using a simple file structure to define stacks, optionally pass variables to them from JSON files and proxy commands to the [AWS CDK Toolkit cli](https://docs.aws.amazon.com/cdk/latest/guide/tools.html) from npm/yarn scripts.

This repository is a [GitHub template](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template), so you can quickly copy it and start tinkering with AWS CDK. Just hit the "Use this template" button on the [this repo's GitHub page](https://github.com/spencerbeggs/aws-cdk-stack-factory).

The walkthrough below will help you understand how to setup and interact with with the system. The stacks, constructs and tests described here are already present in this repository for conveneience. You can remove all the example files and remove references to the boilerplate repo with: `yarn setup`. Documentation on how to use the repo will be available [docs](docs) folder.

## Setup

First you need to install the `cdk` cli globally:

```bash
npm install -g aws-cdk
yarn install
```

Next, you need to created a `.env` file in the root directory and define the following three variables:

1. `AWS_PROFILE`: The name of the [Named Profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) that provides the credentials for your account.
2. `AWS_ACCOUNT_ID`: Your [AWS Account ID](https://docs.aws.amazon.com/IAM/latest/UserGuide/console_account-alias.html) number.
3. `AWS_REGION`: The [AWS Region](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html) to which the `cdk` cli will submit api calls.

The file should look something like this:

```bash
AWS_PROFILE=spencer
AWS_ACCOUNT_ID=7124579443257
AWS_REGION=us-east-1
```

You can also run `yarn env` and a cli will prompt you the values and create the file for you. The `.env` file is not tracked by git.

### Basic Usage

To define a stack, create a new `.ts` file in `src/stacks`. The filename you choose will become the root name of the stack and you will issue commands to the helper scripts by passing it as an argument. For example, let's create a basic stack called `plain-bucket` by creating the file `src/stack/plain-bucket.ts`. It just makes a single S3 bucket:

```typescript
import { App, Stack, StackProps } from "@aws-cdk/core";

import { Bucket } from "@aws-cdk/aws-s3";

// Your exported class must be named TargetStack
export class TargetStack extends Stack {
    public constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);
        // write your code here
        new Bucket(this, "MyBucket");
    }
}
```

Now, we can proxy `cdk` commands to our stack via npm/yarn script in the format: `yarn {stack-filename} {cdk command}`. For example, let's view the CloudFormation template this stack will create if we used `cdk synthesize` command. To do this run `yarn synthesize plain-bucket`. If you are setup correctly, the template will be logged to your console.

To deploy the stack: `yarn deploy plain-bucket`. CDK will now create a stacked name `plain-bucket` in your account.

To clean up, destroy the stack: `yarn destroy plain-bucket`.

### Polymorphic Stacks

Many times will want to create a single stack that accepts options. For example, you may want to create a stack that creates an EC2 instance, but you want it to be different sizes when you deploy it to you your staging or production environments. Let's create a stack similar to the one above, but let's toggle whether the S3 bucket above can be public or not. We will call it `poly-bucket`.

To do this, we are going to create two envs — `public` and `private` — by creating two JSON files inside a subfolder of the `env` folder that is named after our stack name.

Create `env/poly-bucket/public.json`:

```json
{
    "isPublic": true
}
```

Create `env/poly-bucket/private.json`:

```json
{
    "isPublic": false
}
```

The filename you choose for the JSON files will passed as the final argument to the npm/yarn scripts. But first let's create our stack file that utilizes the `isPublic` property of our env files. Create the file `src/stacks/poly-bucket.ts`:

```typescript
import { App, Stack, StackProps } from "@aws-cdk/core";

import { Bucket } from "@aws-cdk/aws-s3";

// Your exported class must be named TargetStack
export class TargetStack extends Stack {
    public constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);
        // write your code here
        // access the isPublic property from the JSON file
        const isPublic = scope.node.tryGetContext("isPublic");
        new Bucket(this, "MyBucket", {
            publicReadAccess: isPublic,
        });
    }
}
```

Now, we can proxy `cdk` commands to our stack and passed them options via npm/yarn script in the format: `yarn {stack-filename} {cdk command} {env-filename}`.

If you synthesize the private bucket, the output will be functionally the same as the `plain-bucket` stack from earlier: `yarn synth poly-bucket private`.

But the the output from the public bucket will be substantially different: `yarn synth poly-bucket public`.

Let's deploy the public stack: `yarn deploy poly-bucket public`. CDK will now create a stacked name `poly-bucket-public` in your account. The env filename is appended with a hypen the the stack name.

To clean up, destroy the stack: `yarn destroy poly-bucket public`.

### Testing Constructs

Using CDK can give you confidence that you are outputing CloudFormation templates that have the correct API. But when you are creating more elaborate stacks or polymorphic constructs, it is helpful to perform unit testing to determine that the resulting template will be configured the way you expect them to be. Breaking your stack into individual constucts and running unit tests on each piece will help you develop faster and save time and money spinning up and tearing down stacks over and over again.

This repo contains a Typescript-compatible [Jest](https://jestjs.io/) setup that can be used with the [@aws-cdk/asset](https://www.npmjs.com/package/@aws-cdk/assert) module. Place your tests inside the `tests` folder and name your test files like `my-construct.test.ts` or `my-construct.sppec.ts`. To run the test suite: `yarn test`

#### Basic Test Exammple

Let's create a basic construct that create as t2.nano EC2 instance in either private or public subnets of a VPC that's id is passed as a prop to the constuct. We would create the file `src/constructs/micro-instance.ts`:

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
// TestApp is a helper class provided by this repo
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
