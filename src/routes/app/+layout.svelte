<script lang="ts">
	import '../../app.css'
	import {liveQuery} from 'dexie'
	import {db} from '$lib/db'
	import NavBar from '$lib/components/NavBar.svelte'
	import {locale, locales} from 'svelte-i18n'
	import {Footer, Card} from 'flowbite-svelte'
	import {base} from '$app/paths'
	import {pwaInfo} from 'virtual:pwa-info'

	let mobile: boolean = false

	// eslint-disable-next-line
	const version = PKG.version ?? 'unknown'
	const congregation = liveQuery(() => db.congregation.orderBy('id').toArray())
	db.congregation
		.orderBy('id')
		.first()
		.then(cong => {
			if (!cong && window.location.pathname != '/new') {
				window.location.pathname = base + '/new'
			}
			if (cong?.lang) {
				$locale = cong.lang
			} else {
				if (!$locales.includes($locale?.split('-')[0])) {
					$locale = 'en'
				}
			}
		})

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : ''

	//Media Queries for Calendar View
	const mediaQuery = window.matchMedia('(width <= 640px)')
	mediaQuery.addEventListener('change', ({matches}) => {
		if (matches) {
			mobile = true
		} else {
			mobile = false
		}
	})
	if (mediaQuery.matches) {
		mobile = true
	} else {
		mobile = false
	}
</script>

{#if $congregation}
	<main>
		<div id="toast-container" class="fixed bottom-0 right-0 z-50 {mobile ? 'mb-20' : ''}">
			{#await import('$lib/components/PWAPrompt.svelte') then { default: PWAPrompt }}
				<PWAPrompt />
			{/await}
		</div>
		{#if $congregation.length > 0}
			<NavBar />
			<slot />
		{/if}
	</main>

	{#if $congregation.length > 0}
		<Footer class="flex flex-row justify-center print:hidden">
			<Card class="mx-5 my-1 text-center dark:text-white {mobile ? 'mb-20' : ''}" size="xl">
				PPOC Gen version {version}
			</Card>
		</Footer>
	{/if}
{/if}

<style lang="postcss">
	main {
		-webkit-print-color-adjust: exact;
		print-color-adjust: exact;
	}
</style>
