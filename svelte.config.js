import adapterStatic from '@sveltejs/adapter-static'
import adapterCloudflare from '@sveltejs/adapter-cloudflare'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

let adapter,
	default_src

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

switch (process.env.PPOCGEN_ENV) {
	case 'production':
		default_src = ['self', 'https://ppocgen.com', 'ws://ppocgen.com']
	  break
	case 'staging':
		default_src = ['self', 'https://dev.ppocgen.com', 'ws://dev.ppocgen.com']
	  break
	default:
		default_src = ['self']
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
		},
		csp: {
			directives: {
			  'default-src': ["'self'"],
			  'script-src': ["'self'"],
			  'style-src': ["'self'", "'unsafe-inline'"],
			  'img-src': ["'self'", 'data:'],
			  'connect-src': ["'self'", 'https://api.open-meteo.com', 'https://nominatim.openstreetmap.org'],
			  'font-src': ["'self'"],
			  'frame-src': ["'none'"],
			}
		},
		csrf: {
			checkOrigin: true
		},
		embedded: false
	}
}

export default config
