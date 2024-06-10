<script lang="ts">
	import '../../app.css'
	import {liveQuery} from 'dexie'
	import {db} from '$lib/db'
	import NavBar from '$lib/components/NavBar.svelte'
	import {locale, locales} from 'svelte-i18n'
	import {Footer, Card, Modal, Button} from 'flowbite-svelte'
	import {base} from '$app/paths'
	import {mobile, installPrompt} from '$lib/stores'
	import {pwaInfo} from 'virtual:pwa-info'
	import {pwaAssetsHead} from 'virtual:pwa-assets/head'
	import {BadgeCheckSolid} from 'flowbite-svelte-icons'
	import {_} from 'svelte-i18n'

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : ''

	let modalInstallPrompt: boolean = false,
		eventInstallPrompt: Event = null

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

	if ($installPrompt == 'true') {
		window.addEventListener('beforeinstallprompt', event => {
			event.preventDefault()
			eventInstallPrompt = event
			modalInstallPrompt = true
		})
	}

	function installPWA() {
		eventInstallPrompt.prompt()
		installPrompt.set('false')
		modalInstallPrompt = false
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

<Modal bind:open={modalInstallPrompt} size="xs" dismissable={false}>
	<div class="text-center">
		<BadgeCheckSolid class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">{$_('home.web-app')}</h3>
		<Button class="me-2" on:click={installPWA}>{$_('general.yes-sure')}</Button>
		<Button
			color="alternative"
			on:click={() => {
				installPrompt.set('false')
				modalInstallPrompt = false
			}}>{$_('general.no-cancel')}</Button
		>
	</div>
</Modal>

<div class="fixed bottom-0 right-0 z-50 {$mobile ? 'mb-20' : ''}">
	{#await import('$lib/components/PWAPrompt.svelte') then { default: PWAPrompt }}
		<PWAPrompt />
	{/await}
</div>

{#if $congregation}
	<main>
		<div id="toast-container" class="fixed bottom-0 right-0 z-50 {$mobile ? 'mb-20' : ''}"></div>
		{#if $congregation.length > 0}
			<NavBar />
			<slot />
		{/if}
	</main>

	{#if $congregation.length > 0}
		<Footer class="flex flex-row justify-center print:hidden">
			<Card class="mx-5 my-1 text-center dark:text-white {$mobile ? 'mb-20' : ''}" size="xl">
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
