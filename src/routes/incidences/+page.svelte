<script lang="ts">
	import {
		Card,
		Input,
		Button,
		Modal,
		Label,
		Select,
		TableSearch,
		TableBody,
		TableBodyRow,
		TableBodyCell,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { SearchSolid, ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import { db } from '$lib/db';
	import { toastMessageSuccess, toastSuccess, toastMessageAlert, toastAlert } from '$lib/store';
	import { liveQuery } from 'dexie';

	let createModal = false;
	let deleteModal = false;
	let edit = false;
	let selectedId: number;
	let searchTerm = '';
	let user_id = 0;
	let start_date = Date.now();
	let end_date = Date.now();

	let incidences = liveQuery(() => db.incidence.toArray());
	$: filteredItems = $incidences?.filter(
		(incidence) => incidence.start_date.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
	);

	async function createIncidence() {
		
	}

</script>

<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto">
	<Card size="xl">
		<Button color="blue" class="mt-1 mb-4"
		on:click={() => {
			createModal = true;
			user_id = 0;
			start_date = Date.now();
			end_date = Date.now();
		}}
		>Create new Incidence</Button>
		{#if $incidences}
			{#if $incidences.length == 0}
				<Card size="xl" class="mt-5">
					<h1 class="text-center">No Incidences yet</h1>
				</Card>
			{:else}
				<TableSearch
					placeholder="Search by start date"
					striped={true}
					hoverable={true}
					bind:inputValue={searchTerm}
				>
					<TableHead>
						<TableHeadCell>Publisher</TableHeadCell>
						<TableHeadCell>Start Date</TableHeadCell>
						<TableHeadCell>End Date</TableHeadCell>
						<TableHeadCell>
							<span class="sr-only">Actions</span>
						</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each filteredItems as incidence}
							<TableBodyRow>
								<TableBodyCell>{incidence.user_id}</TableBodyCell>
								<TableBodyCell>{incidence.start_date}</TableBodyCell>
								<TableBodyCell>{incidence.end_date}</TableBodyCell>
								<TableBodyCell>
									<Button
										color="blue"
										class="mr-2"
										id="edit-{incidence.id}"
										on:click={() => {
											createModal = true;
											selectedId = incidence.id;
											edit = true;
										}}>Edit</Button
									>
									<Button
										color="red"
										class="ml-2"
										id="delete-{incidence.id}"
										on:click={() => {
											deleteModal = true;
											selectedId = incidence.id;
										}}>Delete</Button
									>
								</TableBodyCell>
							</TableBodyRow>
						{/each}
					</TableBody>
				</TableSearch>
			{/if}
		{/if}
	</Card>

	<Modal bind:open={createModal} size="xs" autoclose outsideclose>
		<Label>
			Publisher:
			<Input type="text" id="publisher" bind:value={user_id} required />
		</Label>
		<Label>
			Start Date:
			<Input type="date" id="start_date" bind:value={start_date} required />
		</Label>
		<Label>
			End Date:
			<Input type="date" id="end_date" bind:value={end_date} required />
		</Label>
		<div class="text-center">
			<Button color="red" class="me-2" on:click={createIncidence}>
				{#if edit}
					Edit
				{:else}
					Create
				{/if}
			</Button>
			<Button color="alternative">Cancel</Button>
		</div>
	</Modal>
</div>
