# Basic Usage

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
