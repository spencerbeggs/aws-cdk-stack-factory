module.exports = {
	useTabs: true,
	tabWidth: 2,
	trailingComma: "all",
	printWidth: 125,
	overrides: [
		{
			files: ".prettierrc.js",
			options: { parser: "json" },
		},
	],
};
