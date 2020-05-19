import * as bent from "bent";

import { outputJSON, readJson } from "fs-extra";

import { argv } from "process";

const getJSON = bent('json')

interface Item {
    package: {
        name: string;
        version: string;
    }
}

interface Response {
    results: Item[]
}

function alphabetize(unordered: Record<string, string>): Record<string, string> {
    const ordered = {} as Record<string, string>;
    Object.keys(unordered).sort().forEach(function(key) {
        ordered[key] = unordered[key];
    });
    return ordered;
}

async function main(filter: string): Promise<void> {
    const { results } = await getJSON("https://api.npms.io/v2/search?q=scope:aws-cdk+not:deprecated&size=250") as Response;
    const cdkPackages = results.reduce((acc: Record<string, string>, { package: pkg }) => {
        if (pkg.version === filter) {
            acc[pkg.name] = `^${filter}`;
        }
        return acc;
    }, {});
    const packageJson = await readJson("./package.json");
    packageJson.dependencies = alphabetize(Object.entries(packageJson.dependencies as [string, string])
        .reduce((acc: Record<string, string>, [key, value]) => {
        if (!key.startsWith("@aws-cdk")) {
            acc[key] = value;
        }
        return acc;
    }, cdkPackages));
    packageJson.devDependencies = alphabetize(packageJson.devDependencies);
    await outputJSON("./package.json", packageJson, { spaces: "\t" });
}

main(argv[2]);