import { App, Stack, StackProps } from "@aws-cdk/core";

import { MyConstruct } from "../constructs/imported-construct";

// Your exported class must be named TargetStack
export class TargetStack extends Stack {
    public readonly construct: MyConstruct;
    public constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);
        // write your code here
        this.construct = new MyConstruct(this, "MyConstruct", {});
    }
}
