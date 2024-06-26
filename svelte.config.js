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
//		csp: {
//			mode: 'hash',
//			directives: {
//				'base-uri': ['self'],
//				'child-src': ['self'],
//				'connect-src': ['self', 'ws://localhost:*', 'https://*.open-meteo.com', 'https://*.openstreetmap.org', 'https://*.sentry.io'],
//				'img-src': ['self', 'data:'],
//				'font-src': ['self', 'data:'],
//				'form-action': ['self'],
//				'frame-ancestors': ['self'],
//				'frame-src': ['self'],
//				'manifest-src': ['self'],
//				'media-src': ['self', 'data:'],
//				'object-src': ['none'],
//				'style-src': ['self', 'unsafe-inline'],
//				'default-src': default_src,
//				'script-src': ['self', 'sha256-4N/7e9aYkfuXVBtskvak4XR8lIfkvWsWV0BwGF3wqAk=', 'https://*.cloudflareinsights.com', 'https://*.sentry.io'],
//				'worker-src': ['self', 'localhost']
//			},
//			reportOnly: {
//				'report-to': ['csp-endpoint'],
//				'report-uri': [
//				  `https://*.sentry.io/api/*/security/?sentry_key=*`,
//				],
//			}
//		},
		csrf: {
			checkOrigin: true
		},
		embedded: false
	}
}

export default config
