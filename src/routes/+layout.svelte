<script lang="ts">
	import '../app.css'
	import {pwaInfo} from 'virtual:pwa-info'
	import {pwaAssetsHead} from 'virtual:pwa-assets/head'

	let mobile: boolean = false

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

<slot />
