import adapterStatic from '@sveltejs/adapter-static'
import adapterCloudflare from '@sveltejs/adapter-cloudflare'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

let adapter,
	script_src

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
		script_src = ['self', 'sha256-4N/7e9aYkfuXVBtskvak4XR8lIfkvWsWV0BwGF3wqAk=', 'https://ppocgen.com/cdn-cgi/scripts/7d0fa10a/cloudflare-static/rocket-loader.min.js']
	  break
	case 'staging':
		script_src = ['self', 'sha256-4N/7e9aYkfuXVBtskvak4XR8lIfkvWsWV0BwGF3wqAk=', 'https://dev.ppocgen.com/cdn-cgi/scripts/7d0fa10a/cloudflare-static/rocket-loader.min.js']
	  break
	default:
		script_src = ['self', 'sha256-4N/7e9aYkfuXVBtskvak4XR8lIfkvWsWV0BwGF3wqAk=']
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
			mode: 'hash',
			directives: {
				'base-uri': ['self'],
				'child-src': ['self'],
				'connect-src': ['self', 'ws://localhost:*', 'https://api.open-meteo.com', 'https://nominatim.openstreetmap.org'],
				'img-src': ['self', 'data:'],
				'font-src': ['self', 'data:'],
				'form-action': ['self'],
				'frame-ancestors': ['self'],
				'frame-src': ['self'],
				'manifest-src': ['self'],
				'media-src': ['self', 'data:'],
				'object-src': ['none'],
				'style-src': ['self', 'unsafe-inline'],
				'default-src': ['self'],
				'script-src': script_src,
				'worker-src': ['self']
			}
		},
		csrf: {
			checkOrigin: true
		},
		embedded: false
	}
}

export default config
