# Setup

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
