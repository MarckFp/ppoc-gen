<script lang="ts">
	import '../app.css'
	import {pwaInfo} from 'virtual:pwa-info'
	import {pwaAssetsHead} from 'virtual:pwa-assets/head'
	import {mobile} from '$lib/stores'

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
</script>

<svelte:head>
	{#if pwaAssetsHead.themeColor}
		<meta name="theme-color" content={pwaAssetsHead.themeColor.content} />
	{/if}
</svelte:head>

<slot />
