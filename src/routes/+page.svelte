<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import NavBar from '$lib/components/NavBar.svelte';
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Card
	} from 'flowbite-svelte';

	let congregation = liveQuery(() => db.congregation.toArray());
</script>

<NavBar />

<div class="flex items-center flex-col p-5">
	{#if $congregation}
		<Card class="text-center m-5" size="xl" padding="xl">
			<h5 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
				Welcome {$congregation[0].name}
			</h5>
		</Card>
	{/if}

	<Table class="">
		<TableBody class="divide-y">
			<TableBodyRow>
				<TableBodyCell>Apple MacBook Pro 17"</TableBodyCell>
				<TableBodyCell>Sliver</TableBodyCell>
				<TableBodyCell>Laptop</TableBodyCell>
				<TableBodyCell>$2999</TableBodyCell>
			</TableBodyRow>
			<TableBodyRow>
				<TableBodyCell>Microsoft Surface Pro</TableBodyCell>
				<TableBodyCell>White</TableBodyCell>
				<TableBodyCell>Laptop PC</TableBodyCell>
				<TableBodyCell>$1999</TableBodyCell>
			</TableBodyRow>
			<TableBodyRow>
				<TableBodyCell>Magic Mouse 2</TableBodyCell>
				<TableBodyCell>Black</TableBodyCell>
				<TableBodyCell>Accessories</TableBodyCell>
				<TableBodyCell>$99</TableBodyCell>
			</TableBodyRow>
		</TableBody>
	</Table>
</div>
