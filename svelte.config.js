import adapterStatic from '@sveltejs/adapter-static'
import adapterCloudflare from '@sveltejs/adapter-cloudflare'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

let adapter

switch (process.env.ADAPTER) {
	case 'cloudflare':
		adapter = adapterCloudflare({
			routes: {
				include: ['/*'],
				exclude: ['<all>']
			}
		})
	  	break;
	default:
		adapter = adapterStatic({
			precompress: true,
			fallback: '404.html'
		})
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter,
		serviceWorker: {
			register: false,
		},
		paths: {
			base: '',
			relative: false
		}
	}
}

export default config
