<script lang="ts">
	import '../app.css'
	import {liveQuery} from 'dexie'
	import {db} from '$lib/db'
	import NavBar from '$lib/components/NavBar.svelte'
	import New from '$lib/components/New.svelte'
	import {pwaInfo} from 'virtual:pwa-info'
	import {locale} from 'svelte-i18n'
	import {onMount} from 'svelte'
	import { pwaAssetsHead } from 'virtual:pwa-assets/head'

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

	let congregation = liveQuery(() => db.congregation.toArray())
	db.congregation.toArray().then(cong => {
		if (cong[0].lang) {
			$locale = cong[0].lang
		} else {
			$locale = 'en'
		}
	})

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : ''
</script>

<svelte:head>
	{#if pwaAssetsHead.themeColor}
		<meta name="theme-color" content={pwaAssetsHead.themeColor.content} />
	{/if}
	{#each pwaAssetsHead.links as link}
		<link {...link} />
	{/each}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html webManifestLink}
</svelte:head>

<main>
	{#if $congregation}
		<div id="toast-container" class="fixed bottom-0 right-0 z-50">
			{#await import('$lib/components/PWAPrompt.svelte') then { default: PWAPrompt }}
				<PWAPrompt />
			{/await}
		</div>
		{#if !$congregation[0]}
			<New />
		{:else}
			<NavBar />
			<slot />
		{/if}
	{/if}
</main>
