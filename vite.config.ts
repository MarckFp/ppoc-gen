import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'

const file = fileURLToPath(new URL('package.json', import.meta.url))
const json = readFileSync(file, 'utf8')
const pkg = JSON.parse(json)

export default defineConfig({
	define: {
		PKG: pkg,
		'process.env.NODE_ENV': '"production"',
	},
	build: {
		minify: 'esbuild'
	},
	plugins: [
		sveltekit()
	]
})
