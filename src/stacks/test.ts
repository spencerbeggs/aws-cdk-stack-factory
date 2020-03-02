import { App, Stack, StackProps } from "@aws-cdk/core";

import { AsyncRoutes } from "../constructs/async-routes";

// Your exported class must be named TargetStack
export class TargetStack extends Stack {
    public constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);
        // write your code here
        // access the isPublic property from the JSON file
        new AsyncRoutes(this, "MyBucket", {
            group: "Admin",
            zoneName: "savvy.nyc",
        });
    }
}
