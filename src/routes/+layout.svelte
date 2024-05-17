<script lang="ts">
	import '../app.css'
	import {liveQuery} from 'dexie'
	import {db} from '$lib/db'
	import NavBar from '$lib/components/NavBar.svelte'
	import New from '$lib/components/New.svelte'
	import {locale, locales} from 'svelte-i18n'
	import {Footer, Card} from 'flowbite-svelte'
	import {page} from '$app/stores'
	import {base} from '$app/paths'

	let mobile: boolean = false

	// eslint-disable-next-line
	const version = PKG.version ?? 'unknown'
	const congregation = liveQuery(() => db.congregation.orderBy('id').toArray())
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

	//Media Queries for Calendar View
	const mediaQuery = window.matchMedia('(width <= 640px)')
	mediaQuery.addEventListener('change', ({matches}) => {
		if (matches) {
			mobile = true
		} else {
			mobile = false
		}
	})
	if (mediaQuery.matches) {
		mobile = true
	} else {
		mobile = false
	}
</script>

{#if $congregation}
	<main>
		<div id="toast-container" class="fixed bottom-0 right-0 z-50"></div>
		{#if $congregation.length == 0}
			<New />
		{:else}
			{#if [`${base}/`, `${base}/settings`, `${base}/publishers`, `${base}/schedules`, `${base}/turns`, `${base}/incidences`].includes($page.url.pathname)}
				<NavBar />
			{/if}
			<slot />
		{/if}
	</main>

	{#if $congregation.length > 0}
		{#if [`${base}/`, `${base}/settings`, `${base}/publishers`, `${base}/schedules`, `${base}/turns`, `${base}/incidences`].includes($page.url.pathname)}
			<Footer class="flex flex-row justify-center print:hidden">
				<Card class="mx-5 my-1 text-center dark:text-white {mobile ? 'mb-20' : ''}" size="xl">
					PPOC Gen version {version}
				</Card>
			</Footer>
		{/if}
	{/if}
{/if}

<style lang="postcss">
	main {
		-webkit-print-color-adjust: exact;
		print-color-adjust: exact;
	}
</style>
