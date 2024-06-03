import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { SvelteKitPWA } from '@vite-pwa/sveltekit'
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
		minify: 'terser',
	},
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			devOptions: {
				enabled: false,
				type: 'module',
				navigateFallback: process.env.BASE_PATH ? process.env.BASE_PATH : '/',
				suppressWarnings: true
			},
			strategies: 'generateSW', //This let vite-pwa plugin to generate the SW and the manifest
			registerType: 'prompt', //autoUpdate or prompt depending on what we want. This auto updates the app if a new version appears
			pwaAssets: {
				config: true,
			},
			manifest: {
				name: 'PPOC Gen',
				short_name: 'PPOC Gen',
				description: 'Web application in charge of generating dynamic public preaching turns',
				display: 'standalone',
				display_override: ["standalone", "fullscreen", "minimal-ui", "window-controls-overlay", "browser"],
				theme_color: '#eb4034',
				background_color: "#ffffff",
				start_url: '/app',
				scope: '/app',
				id: '/app',
				lang: "en",
				dir: "ltr",
				categories: ["utilities", "productivity"],
				handle_links: "preferred",
				orientation: "natural",
				scope_extensions: [
					{origin: "marckfp.github.io"}
				],
				related_applications: [
					{
						platform: "windows",
						url: "https://github.com/MarckFp/ppoc-gen/releases/latest"
					},
					{
						platform: "itunes",
						url: "https://github.com/MarckFp/ppoc-gen/releases/latest"
					}
				],
				prefer_related_applications: true,
				launch_handler: {
					client_mode: ["auto", "navigate-existing"]
				},
				edge_side_panel: {
					preferred_width: 500
				},
				file_handlers: [
					{
					  action: "/settings",
					  accept: {
						"text/plain": [".pgen"]
					  }
					}
				],
				shortcuts: [
					{
					  name: "Publishers",
					  url: "/publishers",
					  description: "Opens publishers page",
					  icons: [
						{
							src: "icons/publisher-icon.svg",
							sizes: "96x96",
							type: "image/svg+xml"
						}
					  ]
					},
					{
					  name: "Schedules",
					  url: "/schedules",
					  description: "Opens schedule page",
					  icons: [
						{
							src: "icons/schedule-icon.svg",
							sizes: "96x96",
							type: "image/svg+xml"
						}
					  ]
					},
					{
					  name: "Turns",
					  url: "/turns",
					  description: "Opens turns page",
					  icons: [
						{
							src: "icons/turn-icon.svg",
							sizes: "96x96",
							type: "image/svg+xml"
						}
					  ]
					},
					{
					  name: "Incidences",
					  url: "/incidences",
					  description: "Opens incidence page",
					  icons: [
						{
							src: "icons/incidence-icon.svg",
							sizes: "96x96",
							type: "image/svg+xml"
						}
					  ]
					}
				],
				icons: [
					{
						src: "pwa-64x64.png",
						sizes: "64x64",
						type: "image/png",
						purpose: "any"
					},
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any"
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any"
					},
					{
						src: "maskable-icon-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable"
					}
				],
				screenshots : [
					{
						src: "screenshots/desktop/home.png",
						sizes: "2560x1440",
						type: "image/png",
						form_factor: "wide",
						label: "Desktop Homescreen of PPOC Gen App"
					},
					{
						src: "screenshots/desktop/export.png",
						sizes: "2560x1440",
						type: "image/png",
						form_factor: "wide",
						label: "Desktop Export to PDF or ICS"
					},
					{
						src: "screenshots/desktop/publishers.png",
						sizes: "2560x1440",
						type: "image/png",
						form_factor: "wide",
						label: "Desktop Create, list and Edit publishers"
					},
					{
						src: "screenshots/desktop/schedules.png",
						sizes: "2560x1440",
						type: "image/png",
						form_factor: "wide",
						label: "Desktop Create, list and Edit schedules"
					},
					{
						src: "screenshots/desktop/turns.png",
						sizes: "2560x1440",
						type: "image/png",
						form_factor: "wide",
						label: "Desktop Generate automatically turns with only one click"
					},
					{
						src: "screenshots/smartphone/home.jpg",
						sizes: "1080x2316",
						type: "image/png",
						form_factor: "narrow",
						label: "Mobile Homescreen of PPOC Gen App"
					},
					{
						src: "screenshots/smartphone/export.jpg",
						sizes: "1080x2316",
						type: "image/png",
						form_factor: "narrow",
						label: "Mobile Export to PDF or ICS"
					},
					{
						src: "screenshots/smartphone/publishers.jpg",
						sizes: "1080x2316",
						type: "image/png",
						form_factor: "narrow",
						label: "Mobile Create, list and Edit publishers"
					},
					{
						src: "screenshots/smartphone/schedules.jpg",
						sizes: "1080x2316",
						type: "image/png",
						form_factor: "narrow",
						label: "Mobile Create, list and Edit schedules"
					},
					{
						src: "screenshots/smartphone/turns.jpg",
						sizes: "1080x2316",
						type: "image/png",
						form_factor: "narrow",
						label: "Mobile Generate automatically turns with only one click"
					}
				]
			}
		})
	]
})
