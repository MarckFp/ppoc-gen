<script lang="ts">
	import NavBar from '$lib/components/NavBar.svelte'
	import {locale, locales} from 'svelte-i18n'
	import {Footer, Card} from 'flowbite-svelte'
	import {base} from '$app/paths'
	import {mobile} from '$lib/stores'
	import {pwaInfo} from 'virtual:pwa-info'
	import {pwaAssetsHead} from 'virtual:pwa-assets/head'
	import {_} from 'svelte-i18n'
	import {page} from '$app/stores'

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : ''

	// eslint-disable-next-line
	const version = PKG.version ?? 'unknown'

	if ($page.data.congregation != undefined) {
		if ($page.data.congregation.lang != undefined) {
			$locale = $page.data.congregation.lang
		} else {
			if ($locale && !$locales.includes($locale?.split('-')[0])) {
				$locale = 'en'
			}
		}
	} else if ($page.data.congregation == undefined && window.location.pathname != '/new') {
		window.location.pathname = base + '/new'
	}
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

<main>
	<div id="toast-container" class="fixed bottom-0 right-0 z-50 {$mobile ? 'mb-20' : ''}"></div>
	{#if $page.data.congregation != undefined}
		<NavBar />
		<slot />
	{/if}
</main>

{#if $page.data.congregation != undefined}
	<Footer class="flex flex-row justify-center print:hidden">
		<Card class="mx-5 my-1 text-center dark:text-white {$mobile ? 'mb-20' : ''}" size="xl">
			PPOC Gen version {version}
		</Card>
	</Footer>
{/if}

<style lang="postcss">
	main {
		-webkit-print-color-adjust: exact;
		print-color-adjust: exact;
	}
</style>
