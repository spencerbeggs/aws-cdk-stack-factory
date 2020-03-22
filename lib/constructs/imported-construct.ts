import { Construct } from "@aws-cdk/core";

// Delete this when you define an interface
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface MyConstructProps {}

export class MyConstruct extends Construct {
    // Delete these comments when you define an interface
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    public constructor(scope: Construct, id: string, props: MyConstructProps) {
        super(scope, id);
        // write your code here
    }
}
