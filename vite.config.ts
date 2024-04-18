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
				navigateFallback: process.argv.includes('dev') ? '/' : process.env.BASE_PATH
			},
			srcDir: 'src',
			strategies: 'injectManifest',
			filename: 'prompt-sw.ts',
			scope: process.argv.includes('dev') ? '/' : process.env.BASE_PATH,
			base: process.argv.includes('dev') ? '/' : process.env.BASE_PATH,
			injectManifest: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}']
			},
			workbox: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}']
			},
			includeAssets: ['static/favicon.ico', 'static/apple-touch-icon.png', 'static/maskable_icon.png', 'static/favicon-16x16.png', 'static/favicon-32x32.png'],
			manifest: {
				name: 'Public Preaching Generator',
				short_name: 'PPOC Gen',
				description: 'Web application in charge of generating dynamic public preaching turns',
				display: 'standalone',
				scope: process.argv.includes('dev') ? '/' : process.env.BASE_PATH,
				start_url: process.argv.includes('dev') ? '/' : process.env.BASE_PATH,
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
