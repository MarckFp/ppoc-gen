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
			strategies: 'generateSW',
			registerType: 'autoUpdate', //autoUpdate or prompt depending on what we want
			scope: process.argv.includes('dev') ? '/' : process.env.BASE_PATH,
			workbox: {
				globPatterns: ['client/**/*.{js,css,ico,png,txt,svg,webp,webmanifest}', 'prerendered/**/*.html'],
				runtimeCaching: [
					{
						urlPattern: ({url}) => url.pathname === (process.argv.includes('dev') ? '/' : process.env.BASE_PATH + 'publishers'),
						handler: 'NetworkFirst',
						method: 'GET',
					},
					{
						urlPattern: ({url}) => url.pathname === (process.argv.includes('dev') ? '/' : process.env.BASE_PATH + 'schedules'),
						handler: 'NetworkFirst',
						method: 'GET',
					},
					{
						urlPattern: ({url}) => url.pathname === (process.argv.includes('dev') ? '/' : process.env.BASE_PATH + 'turns'),
						handler: 'NetworkFirst',
						method: 'GET',
					},
					{
						urlPattern: ({url}) => url.pathname === (process.argv.includes('dev') ? '/' : process.env.BASE_PATH + 'incidences'),
						handler: 'NetworkFirst',
						method: 'GET',
					},
					{
						urlPattern: ({url}) => url.pathname === (process.argv.includes('dev') ? '/' : process.env.BASE_PATH + 'settings'),
						handler: 'NetworkFirst',
						method: 'GET',
					}
				]
			},
			includeAssets: ['static/favicon.ico', 'static/favicon.svg', 'static/favicon-16x16.png', 'static/favicon-32x32.png'],
			pwaAssets: {
				config: true,
			},
			manifest: {
				name: 'Public Preaching Generator',
				short_name: 'PPOC Gen',
				description: 'Web application in charge of generating dynamic public preaching turns',
				display: 'standalone',
				scope: process.argv.includes('dev') ? '/' : process.env.BASE_PATH,
				start_url: process.argv.includes('dev') ? '/' : process.env.BASE_PATH,
				theme_color: '#eb4034'
			}
		})
	]
});
