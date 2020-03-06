import { emptyDir } from "fs-extra";
import { resolve } from "path";

function path(rel: string): string {
    return resolve(__dirname, rel);
}

async function main(): Promise<void> {
    await emptyDir(path("../envs"));
    await emptyDir(path("../src/stacks"));
    await emptyDir(path("../src/constructs"));
    await emptyDir(path("../tests"));
}

main();
