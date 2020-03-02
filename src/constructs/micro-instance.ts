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
