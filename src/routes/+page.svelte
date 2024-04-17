<script lang="ts">
	import {liveQuery} from 'dexie'
	import {db} from '$lib/db'
	import {Card} from 'flowbite-svelte'
	import {_} from 'svelte-i18n'
	import Calendar from '$lib/components/Calendar.svelte'

	let congregation = liveQuery(() => db.congregation.toArray())

	//let plugins = [TimeGrid];
	let options = {
		view: 'timeGridWeek',
		events: [
			// your list of events
		]
	}
</script>

<div class="flex flex-col items-center m-5">
	{#if $congregation}
		<Card class="text-center" size="xl" padding="xl">
			<h5 class="text-3xl font-bold text-gray-900 dark:text-white">
				{$_('home.welcome')}
				{$congregation[0].name}
			</h5>
		</Card>
	{/if}
	<Calendar />
</div>
