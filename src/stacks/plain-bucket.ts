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
