# Workflow Helpers

This repo is setup with a few workflow helpers. Below you can find information on them and info about how to disable them if you want.

## Prettier and ESLint

This repo is setup with [Prettier](https://prettier.io/) and [TypeScript ESLint](https://github.com/typescript-eslint/typescript-eslint). You can change base Prettier config in `.prettierrc.s` and the linting rules in `.eslintrc.js`. You can check and format your code by running `yarn lint`.

## Dependabot Integration

This repo is setup with automatic [Dependabot](https://github.com/marketplace/dependabot-preview) integration. Dependabot will scan your repos and make pull requests when your dependencies get out of date. You can [customize the configuration](https://dependabot.com/docs/config-file/) by changing `.dependabot/config.yml`. You can prevent this by deleting the `.dependabot` folder or running `yarn disable dependabot`.

## Git Commit Hooks

This repo integrates [Husky](https://www.npmjs.com/package/husky), which will run [Git commit hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) on every commit. It will automatically lint and format your code if it can but fail if it cannot. If this is too strict and tripping you up, you can disable it by removing the `husky` and `lint-staged` properties in `package.json`. You can also run `yarn disable hooks`.

## VSCode Integration

This repo contains [VSCode Workspace Settings](https://code.visualstudio.com/docs/getstarted/settings) along with reccomended extentions. If you install the exetntions you code will be formatted and linted as you work. You can modify the settings in JSON files the `.vscode` folder. You can disable it compeletly by deelting the folder or running `yarn disable vscode`.
