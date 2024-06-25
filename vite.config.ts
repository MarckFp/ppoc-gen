import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { SvelteKitPWA } from '@vite-pwa/sveltekit'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'

const file = fileURLToPath(new URL('package.json', import.meta.url))
const json = readFileSync(file, 'utf8')
const pkg = JSON.parse(json)

let name: string = 'PPOC Gen',
	theme_color: string = '#eb4034',
	origin: string = 'ppocgen.com'

switch (process.env.PPOCGEN_ENV) {
	case 'production':
		name = 'PPOC Gen',
		theme_color = '#eb4034',
		origin = 'ppocgen.com'
	  break
	case 'staging':
		name = 'Dev PPOC Gen'
		theme_color = '#53d4f7'
		origin = 'dev.ppocgen.com'
	  break
	default:
		name = 'Localhost PPOC Gen'
		theme_color = '#34eb64'
		origin = 'localhost'
}

export default defineConfig({
	define: {
		PKG: pkg
	},
	build: {
		minify: 'esbuild',
	},
	plugins: [
        sveltekit(),
        SvelteKitPWA({
            devOptions: {
                enabled: true,
                type: 'module',
                navigateFallback: '/',
                suppressWarnings: true
            },
            strategies: 'generateSW', //This let vite-pwa plugin to generate the SW and the manifest
            registerType: 'prompt', //autoUpdate or prompt depending on what we want. This auto updates the app if a new version appears
            pwaAssets: {
                disabled: false,
                config: true,
            },
            manifest: {
                name: name,
                short_name: name,
                description: 'Web application in charge of generating dynamic public preaching turns',
                display: 'standalone',
                display_override: ["standalone", "fullscreen", "minimal-ui", "window-controls-overlay", "browser"],
                theme_color: theme_color,
                background_color: "#ffffff",
                start_url: '/app',
                scope: '/',
                id: '/app',
                lang: "en",
                dir: "ltr",
                categories: ["utilities", "productivity"],
                handle_links: "preferred",
                orientation: "natural",
                scope_extensions: [
                    {origin: origin}
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
                prefer_related_applications: false,
                launch_handler: {
                    client_mode: ["auto", "navigate-existing"]
                },
                edge_side_panel: {
                    preferred_width: 500
                },
                file_handlers: [
                    {
                        action: "/app/settings",
                        accept: {
                            "text/plain": [".pgen"]
                        }
                    }
                ],
                shortcuts: [
                    {
                    name: "Publishers",
                    url: "/app/publishers",
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
                    url: "/app/schedules",
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
                    url: "/app/turns",
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
                    url: "/app/incidences",
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
