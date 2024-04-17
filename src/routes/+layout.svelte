<script lang="ts">
	import '../app.css'
	import {liveQuery} from 'dexie'
	import {db} from '$lib/db'
	import NavBar from '$lib/components/NavBar.svelte'
	import New from '$lib/components/New.svelte'
	import {registerSW} from 'virtual:pwa-register'
	import {pwaInfo} from 'virtual:pwa-info'
	import {locale, _} from 'svelte-i18n'

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : ''

	//TODO: Add Callbacks when app is offline or need refresh following https://vite-pwa-org.netlify.app/guide/prompt-for-update.html
	const intervalMS: number = 60 * 60 * 1000
	registerSW({
		immediate: true,
		onOfflineReady() {},
		onNeedRefresh() {},
		onRegistered(r) {
			r &&
				setInterval(() => {
					r.update()
				}, intervalMS)
		}
	})
	let congregation = liveQuery(() => db.congregation.toArray())
	db.congregation.toArray().then(cong => {
		if (cong[0].lang){
			$locale = cong[0].lang
		} else {
			$locale = 'en'
		}
	})
</script>

<svelte:head>
	{@html webManifestLink}
</svelte:head>

<main>
	{#if $congregation}
		<div id="toast-container" class="fixed bottom-0 right-0 z-50"></div>
		{#if !$congregation[0]}
			<New />
		{:else}
			<NavBar />
			<slot />
		{/if}
	{/if}
</main>
