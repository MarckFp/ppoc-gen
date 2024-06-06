<script lang="ts">
	import '../app.css'
	import {pwaInfo} from 'virtual:pwa-info'
	import {pwaAssetsHead} from 'virtual:pwa-assets/head'
	import {db} from '$lib/db'
	import {mobile, weekOrder, nameOrder} from '$lib/stores'

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : ''

	//Media Queries for Calendar View
	const mediaQuery = window.matchMedia('(width <= 640px)')
	mediaQuery.addEventListener('change', ({matches}) => {
		if (matches) {
			mobile.set(true)
		} else {
			mobile.set(false)
		}
	})
	if (mediaQuery.matches) {
		mobile.set(true)
	} else {
		mobile.set(false)
	}

	db.congregation
		.orderBy('id')
		.first()
		.then(congregation => {
			weekOrder.set(congregation?.week_order)
			nameOrder.set(congregation?.name_order)
		})
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

<div class="fixed bottom-0 right-0 z-50 {$mobile ? 'mb-20' : ''}">
	{#await import('$lib/components/PWAPrompt.svelte') then { default: PWAPrompt }}
		<PWAPrompt />
	{/await}
</div>

<slot />
