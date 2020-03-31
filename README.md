# AWS CDK Stack Factory 🏭

This repo is bootstrap-able template for building, testing and deploying [AWS Cloud Development Kit](https://docs.aws.amazon.com/cdk/latest/guide/home.html) stacks and constructs in [Typescript](https://www.typescriptlang.org/). It works by using a simple file structure to define stacks, optionally pass variables to them from JSON files and proxy commands to the [AWS CDK Toolkit cli](https://docs.aws.amazon.com/cdk/latest/guide/tools.html) from npm/yarn scripts.

This repository is a [GitHub template](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template), so you can quickly clone it into your own repo and start tinkering. Just hit the "Use this template" button on the [this repo's GitHub page](https://github.com/spencerbeggs/aws-cdk-stack-factory) when you are logged in. This repo contains demo stack, construct and test files.

You can bootstrap this repository into a testable and ready-to-use state with: `yarn bootstrap`.

If you are new here, [read the documentation](docs):

- [Environment Setup](docs/setup)
- [Creating Stacks and Constructs](docs/usage)
- [Testing Your Code](docs/testing)
- [Workflow Helpers](docs/workflow)

## Help Improve AWS CDK

If you love working with AWS CDK, you can use this repo to help [the team building CDK](https://github.com/aws/aws-cdk) improve it. Bootstrap this  repo and setup stacks and constructs and with unit tests. They are very friendly and responsive to bug reports and feature requests. Do your part and provide them with tests cases when you [file issues](https://github.com/aws/aws-cdk/issues) 💪.

## Credits and Contributing

This repo borrows from and builds upon many of the ideas from the [Open CDK Guide](https://github.com/kevinslin/open-cdk). If you want to improve this template, please [open an issue](https://github.com/spencerbeggs/aws-cdk-stack-factory/issues) or [pull request](https://github.com/spencerbeggs/aws-cdk-stack-factory/pulls).
