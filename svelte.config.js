import adapterStatic from '@sveltejs/adapter-static'
import adapterCloudflare from '@sveltejs/adapter-cloudflare'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: process.env.ADAPTER == 'cloudflare'
		? adapterCloudflare({
			routes: {
				include: ['/*']
			},
			precompress: true,
			fallback: '404.html'
		})
		: adapterStatic({
			precompress: true,
			fallback: '404.html'
		}),
		serviceWorker: {
			register: false,
		}
	}
}

export default config
