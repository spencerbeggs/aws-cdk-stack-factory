module.exports = {
	useTabs: true,
	tabWidth: 2,
	trailingComma: "all",
	printWidth: 125,
	"overrides": [
		{
			"files": [".prettierrc", ".eslintrc", ".babelrc", "package.json"],
			"options": { "parser": "json" }
		}
	]
};
