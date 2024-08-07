<script lang="ts">
	import '../app.css'
	import {mobile, weekOrder, nameOrder} from '$lib/stores'
	import {page} from '$app/stores'
	import {pwaAssetsHead} from 'virtual:pwa-assets/head'
	import {pwaInfo} from 'virtual:pwa-info'

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

	if ($page.data.congregation != undefined) {
		weekOrder.set($page.data.congregation.week_order)
		nameOrder.set($page.data.congregation.name_order)
	}

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : ''
</script>

<svelte:head>
	<link rel="canonical" href="https://ppocgen.com{window.location.pathname}" />

	{#if pwaAssetsHead.themeColor}
		<meta name="theme-color" content={pwaAssetsHead.themeColor.content} />
	{/if}
	{#each pwaAssetsHead.links as link}
		<link {...link} />
	{/each}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html webManifestLink}
</svelte:head>

<slot />
