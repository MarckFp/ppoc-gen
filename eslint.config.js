import eslint from "@eslint/js"
import tsEslint from 'typescript-eslint'
import eslintPluginSvelte from 'eslint-plugin-svelte'
import svelteParser from "svelte-eslint-parser"
import eslintConfigPrettier from "eslint-config-prettier"
import globals from "globals"

export default [
	eslint.configs.recommended,
	...tsEslint.configs.recommended,
	...eslintPluginSvelte.configs['flat/recommended'],
	eslintConfigPrettier,
	...eslintPluginSvelte.configs["flat/prettier"],
	{
		files: ['**/*.svelte'],
		ignores: [".DS_Store", "node_modules", "/build", "/.svelte-kit", "/package", ".env", ".env.*", "!.env.example", "pnpm-lock.yaml", "package-lock.json", "yarn.lock"],
		languageOptions: {
			parser: svelteParser,
			sourceType: 'module',
			ecmaVersion: 2020,
			parserOptions: {
				extraFileExtensions: ['.svelte'],
				parser: tsEslint.parser
			},
			globals: {
				...globals.browser
			}
		}
	},
	{
		files: ["**/*.ts"],
		ignores: [".DS_Store", "node_modules", "/build", "/.svelte-kit", "/package", ".env", ".env.*", "!.env.example", "pnpm-lock.yaml", "package-lock.json", "yarn.lock"],
		languageOptions: {
			parser: tsEslint.parser
		}
	},
	{
		plugins: {
			"@typescript-eslint": tsEslint.plugin,
		}
	}
]