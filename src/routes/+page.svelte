<script lang="ts">
	import {liveQuery} from 'dexie'
	import {db} from '$lib/db'
	import {Card, GradientButton} from 'flowbite-svelte'
	import {GithubSolid, BookSolid} from 'flowbite-svelte-icons'
	import {_} from 'svelte-i18n'
	import Calendar from '$lib/components/Calendar.svelte'

	let congregation = liveQuery(() => db.congregation.toArray())
</script>

<div class="m-5 flex flex-col items-center">
	{#if $congregation}
		<Card class="text-center" size="xl" padding="xl">
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white">
				{$_('home.welcome')}
				{$congregation[0].name}
			</h1>
		</Card>
	{/if}
	<Card size="xl" padding="xl" class="mt-5">
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white">{$_('home.thank-you')}</h2>
		<p class="mt-3 text-gray-900 dark:text-white">
			{$_('home.apps')}<GradientButton href="https://github.com/MarckFp/ppoc-gen/releases" color="cyanToBlue"
				>GitHub <GithubSolid /></GradientButton
			>
		</p>
		<p class="mt-5 text-gray-900 dark:text-white">
			{$_('home.read-the-docs')}<GradientButton
				color="teal"
				href="https://github.com/MarckFp/ppoc-gen/blob/main/docs/README.md"
				>{$_('home.docs')} <BookSolid /></GradientButton
			>
		</p>
	</Card>
	<Calendar />
</div>
