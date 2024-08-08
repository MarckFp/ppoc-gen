<script lang="ts">
	import NavBar from '$lib/components/NavBar.svelte'
	import {locale, locales} from 'svelte-i18n'
	import {Footer, Card, Modal, Button} from 'flowbite-svelte'
	import {base} from '$app/paths'
	import {mobile, installPrompt} from '$lib/stores'
	import {BadgeCheckSolid} from 'flowbite-svelte-icons'
	import {_} from 'svelte-i18n'
	import {page} from '$app/stores'
	import {fly} from 'svelte/transition'

	let modalInstallPrompt: boolean = false,
		eventInstallPrompt: Event

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

<main>
	<div id="toast-container" class="fixed bottom-0 right-0 z-50 {$mobile ? 'mb-20' : ''}"></div>
	{#if $page.data.congregation != undefined}
		<NavBar />
		{#key $page.url.pathname}
			<div in:fly={{x: -200, duration: 250, delay: 250}} out:fly={{x: 200, duration: 150}}>
				<div>
					<slot />
				</div>
				{#if $page.data.congregation != undefined}
					<Footer class="flex flex-row justify-center print:hidden">
						<Card class="mx-5 my-1 text-center dark:text-white {$mobile ? 'mb-20' : ''}" size="xl">
							PPOC Gen version {version}
						</Card>
					</Footer>
				{/if}
			</div>
		{/key}
	{/if}
</main>

<style lang="postcss">
	main {
		-webkit-print-color-adjust: exact;
		print-color-adjust: exact;
	}
</style>
