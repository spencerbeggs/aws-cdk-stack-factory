import { HostedZone, IHostedZone, RecordTarget } from "@aws-cdk/aws-route53";

import { ARecord } from "@aws-cdk/aws-route53/lib/record-set";
import { Construct } from "@aws-cdk/core";
import { IAM } from "aws-sdk";

interface AsyncRoutesProps {
    group: string;
    zoneName: string;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface QuerablePromise {
    isPending?: boolean;
    isRejected?: boolean;
    isFulfilled?: boolean;
    value?: {
        Users: [IAM.GetUserResponse];
    };
    promise?: Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MakeQuerablePromise(promise: Promise<any>): QuerablePromise {
    // Set initial state
    const result: QuerablePromise = {
        isPending: true,
        isRejected: false,
        isFulfilled: false,
        promise: promise,
    };
    // Observe the promise, saving the fulfillment in a closure scope.
    promise
        .then(value => {
            result.value = value;
            result.isFulfilled = true;
            result.isPending = false;
            return;
        })
        .catch(err => {
            result.isRejected = true;
            result.isPending = false;
            throw err;
        });
    return result;
}

export class AsyncRoutes extends Construct {
    private zone: IHostedZone;
    public constructor(scope: Construct, id: string, props: AsyncRoutesProps) {
        super(scope, id);
        const { zoneName, group } = props;
        this.zone = HostedZone.fromLookup(this, "ImportedZone", {
            domainName: zoneName,
        });
        const iam = new IAM();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const req = MakeQuerablePromise(
            iam
                .getGroup({
                    GroupName: group,
                })
                .promise(),
        );
        console.log(req);

        while (!req.isPending) {
            if (req.isFulfilled) {
                break;
            }
        }
        console.log("ff");
        console.log(req);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req.value.Users.forEach((User: any) => {
            console.log(User);
            new ARecord(this, `${User.Username}-record`, {
                target: RecordTarget.fromIpAddresses("123.45.67.8"),
                zone: this.zone,
                recordName: `${User.Username}.${this.zone.zoneName}`,
            });
            console.log("ff");
        });
        console.log("end");
    }
}
