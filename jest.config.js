module.exports = {
    preset: "ts-jest/presets/js-with-ts",
    testEnvironment: "node",
    globals: {
        "ts-jest": {
            packageJson: "package.json",
            tsConfig: "tsconfig.json",
        },
    },
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testRegex: "(/tests/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    collectCoverage: true,
    coverageReporters: ["text"],
    maxConcurrency: 10,
};
