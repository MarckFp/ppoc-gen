<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { Card } from 'flowbite-svelte';
	import { _ } from 'svelte-i18n';
	//import Calendar from '@event-calendar/core';
	//import TimeGrid from '@event-calendar/time-grid';
	import Calendar from '$lib/components/Calendar.svelte';

	let congregation = liveQuery(() => db.congregation.toArray());

	//let plugins = [TimeGrid];
	let options = {
		view: 'timeGridWeek',
		events: [
			// your list of events
		]
	};
</script>

<div class="flex items-center flex-col">
	{#if $congregation}
		<Card class="text-center m-5" size="xl" padding="xl">
			<h5 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
				{$_('home.welcome')} {$congregation[0].name}
			</h5>
		</Card>
	{/if}
	<Calendar />
</div>
