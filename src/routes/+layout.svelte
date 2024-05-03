<script lang="ts">
	import '../app.css'
	import {liveQuery} from 'dexie'
	import {db} from '$lib/db'
	import NavBar from '$lib/components/NavBar.svelte'
	import New from '$lib/components/New.svelte'
	import {pwaInfo} from 'virtual:pwa-info'
	import {locale, locales} from 'svelte-i18n'
	import {onMount} from 'svelte'
	import {Footer, Card} from 'flowbite-svelte'

	onMount(async () => {
		if (pwaInfo) {
			const {registerSW} = await import('virtual:pwa-register')
			registerSW({
				immediate: true,
				onRegistered(r) {
					r &&
						setInterval(() => {
							r.update()
						}, 10000 /* 10s for testing purposes */)
				},
				onRegisterError(error) {
					console.log('SW registration error', error)
				}
			})
		}
	})

	// eslint-disable-next-line
	const version = PKG.version ?? 'unknown'
	const congregation = liveQuery(() => db.congregation.orderBy('id').first())
	db.congregation
		.orderBy('id')
		.first()
		.then(cong => {
			if (cong?.lang) {
				$locale = cong.lang
			} else {
				if (!$locales.includes($locale?.split('-')[0])) {
					$locale = 'en'
				}
			}
		})

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : ''
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html webManifestLink}
</svelte:head>

<main>
	<div id="toast-container" class="fixed bottom-0 right-0 z-50">
		{#await import('$lib/components/PWAPrompt.svelte') then { default: PWAPrompt }}
			<PWAPrompt />
		{/await}
	</div>
	{#if !$congregation}
		<New />
	{:else}
		<NavBar />
		<slot />
		<Footer class="flex flex-row justify-center print:hidden">
			<Card class="mx-5 my-1 text-center dark:text-white" size="xl">
				PPOC Gen version {version}
			</Card>
		</Footer>
	{/if}
</main>

<style lang="postcss">
	main {
		-webkit-print-color-adjust: exact;
		color-adjust: exact;
	}
</style>
