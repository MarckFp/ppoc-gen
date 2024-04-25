import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit'
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		minify: 'esbuild'
	},
	plugins: [
		enhancedImages(),
		sveltekit(),
		SvelteKitPWA({
			devOptions: {
				enabled: true,
				type: 'module',
				navigateFallback: process.argv.includes('dev') ? '/' : process.env.BASE_PATH,
				suppressWarnings: true
			},
			srcDir: 'src',
			strategies: 'generateSW', //This let vite-pwa plugin to generate the SW and the manifest
			registerType: 'autoUpdate', //autoUpdate or prompt depending on what we want. This auto updates the app if a new version appears
			workbox: {
				cleanupOutdatedCaches: true,
				globPatterns: ['client/**/*.{js,css,ico,png,txt,svg,webp,webmanifest}', 'prerendered/**/*.html'],
				runtimeCaching: [
					{
						urlPattern: ({url}) => url.pathname === (process.argv.includes('dev') ? '/' : process.env.BASE_PATH + '/publishers'),
						handler: 'NetworkFirst',
						options: {
							cacheableResponse: {
								statuses: [200]
							},
							matchOptions: {
								ignoreVary: true,
								ignoreSearch: true,
							},
						}
					},
					{
						urlPattern: ({url}) => url.pathname === (process.argv.includes('dev') ? '/' : process.env.BASE_PATH + '/schedules'),
						handler: 'NetworkFirst',
						method: 'GET',
						options: {
							cacheableResponse: {
								statuses: [200]
							},
							matchOptions: {
								ignoreVary: true,
								ignoreSearch: true,
							},
						}
					},
					{
						urlPattern: ({url}) => url.pathname === (process.argv.includes('dev') ? '/' : process.env.BASE_PATH + '/turns'),
						handler: 'NetworkFirst',
						method: 'GET',
						options: {
							cacheableResponse: {
								statuses: [200]
							},
							matchOptions: {
								ignoreVary: true,
								ignoreSearch: true,
							},
						}
					},
					{
						urlPattern: ({url}) => url.pathname === (process.argv.includes('dev') ? '/' : process.env.BASE_PATH + '/incidences'),
						handler: 'NetworkFirst',
						method: 'GET',
						options: {
							cacheableResponse: {
								statuses: [200]
							},
							matchOptions: {
								ignoreVary: true,
								ignoreSearch: true,
							},
						}
					},
					{
						urlPattern: ({url}) => url.pathname === (process.argv.includes('dev') ? '/' : process.env.BASE_PATH + '/settings'),
						handler: 'NetworkFirst',
						method: 'GET',
						options: {
							cacheableResponse: {
								statuses: [200]
							},
							matchOptions: {
								ignoreVary: true,
								ignoreSearch: true,
							},
						}
					}
				]
			},
			includeAssets: ['favicon.ico', 'favicon.svg', 'favicon-16x16.png', 'favicon-32x32.png'],
			manifest: {
				name: 'Public Preaching Generator',
				short_name: 'PPOC Gen',
				description: 'Web application in charge of generating dynamic public preaching turns',
				display: 'standalone',
				start_url: process.argv.includes('dev') ? '/' : process.env.BASE_PATH + '/',
				scope: process.argv.includes('dev') ? '/' : process.env.BASE_PATH + '/',
				theme_color: '#eb4034',
				icons: [
					{
						src: 'android-chrome-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'android-chrome-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: 'pwa-maskable-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'maskable'
					},
					{
						src: 'pwa-maskable-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					},
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any'
					}
				],
			}
		})
	]
});
