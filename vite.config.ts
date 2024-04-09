import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit'
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		enhancedImages(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
				cleanupOutdatedCaches: true,
				sourcemap: true
			}
		})
	]
});
