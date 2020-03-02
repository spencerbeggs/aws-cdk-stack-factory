import * as AWS from "aws-sdk";

import { Construct, Lazy } from "@aws-cdk/core";
import { HostedZone, RecordTarget } from "@aws-cdk/aws-route53";

import { ARecord } from "@aws-cdk/aws-route53/lib/record-set";

interface AsyncRoutesProps {
    group: string;
    zoneName: string;
}

export class AsyncRoutes extends Construct {
    public constructor(scope: Construct, id: string, props: AsyncRoutesProps) {
        super(scope, id);
        const { zoneName, group } = props;
        const zone = HostedZone.fromLookup(this, "ImportedZone", {
            domainName: zoneName,
        });
        console.log("FHHG");
        const usernames = Lazy.listValue(
            {
                produce(context): string[] {
                    console.log("Hi");
                    const iam = new AWS.IAM();
                    const arr: string[] = [];
                    iam.getGroup(
                        {
                            GroupName: group,
                        },
                        (err, { Users }) => {
                            console.log(err);
                            console.log(Users);
                            Users.forEach(user => arr.push(user.UserName));
                            context.resolve(arr);
                        },
                    );
                    while (true) {
                        if (!context.preparing) {
                            break;
                        }
                    }
                    return arr;
                },
            },
            { displayHint: "Username", omitEmpty: true },
        );
        usernames.forEach(username => {
            new ARecord(this, `${username}-record`, {
                target: RecordTarget.fromIpAddresses("123.45.67.8"),
                zone: zone,
                recordName: `${username}.${zone.zoneName}`,
            });
        });
    }
}
