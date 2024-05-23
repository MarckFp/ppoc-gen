<script lang="ts">
	import {liveQuery} from 'dexie'
	import {db} from '$lib/db'
	import {Card, GradientButton, Toast} from 'flowbite-svelte'
	import {GithubSolid, BookSolid, ExclamationCircleSolid} from 'flowbite-svelte-icons'
	import {_} from 'svelte-i18n'
	import Calendar from '$lib/components/Calendar.svelte'

	let congregation = liveQuery(() => db.congregation.orderBy('id').first())
	const announcement = ``
</script>

<section class="m-5 flex flex-col items-center">
	{#if $congregation}
		<Card class="text-center" size="xl" padding="xl">
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white">
				{$_('home.welcome')}
				{$congregation.name}
			</h1>
		</Card>
	{/if}
	<Card size="xl" padding="xl" class="mt-5">
		<h2 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{$_('home.thank-you')}</h2>
		<hr />
		<p class="mt-2 text-gray-900 dark:text-white">
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
	{#if announcement != ''}
		<Toast color="orange" class="my-2 w-full max-w-screen-xl text-gray-900 dark:text-white">
			<svelte:fragment slot="icon">
				<ExclamationCircleSolid class="h-5 w-5" />
				<span class="sr-only">Warning icon</span>
			</svelte:fragment>
			<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{$_('home.announcement')}:</h5>
			<p>{announcement}</p>
		</Toast>
	{/if}
	<Card size="xl" padding="sm" class="dark:ec-auto-dark m-4 flex flex-col items-center">
		<Calendar />
	</Card>
</section>
