<script lang="ts">
	import '../app.css'
	import {liveQuery} from 'dexie'
	import {db} from '$lib/db'
	import NavBar from '$lib/components/NavBar.svelte'
	import New from '$lib/components/New.svelte'
	import {locale, locales} from 'svelte-i18n'
	import {Footer, Card} from 'flowbite-svelte'

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
</script>

{#if $congregation}
	<main>
		<div id="toast-container" class="fixed bottom-0 right-0 z-50"></div>
		{#if $congregation.length == 0}
			<New />
		{:else}
			<NavBar />
			<slot />
		{/if}
	</main>

	{#if $congregation.length > 0}
		<Footer class="flex flex-row justify-center print:hidden">
			<Card class="mx-5 my-1 text-center dark:text-white" size="xl">
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
