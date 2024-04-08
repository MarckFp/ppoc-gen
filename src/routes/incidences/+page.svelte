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
	import { onMount } from 'svelte';

	let createModal = false;
	let deleteModal = false;
	let edit = false;
	let selectedId: number;
	let searchTerm = '';
	let user_id = 0;
	let userSelect: Array<{ value: number; name: string }> = [];
	let userList: string[] = [];
	let now = new Date(),
		month,
		day,
		year;
	let start_date: string;
	let end_date: string;

	let incidences = liveQuery(() => db.incidence.toArray());
	let users = db.user.toArray().then(() => {
		db.user.each((user) => {
			userSelect.push({ value: user.id, name: user.firstname + ' ' + user.lastname });
			userList[user.id] = user.firstname + ' ' + user.lastname;
		});
	});

	onMount(() => {
		(month = '' + (now.getMonth() + 1)), (day = '' + now.getDate()), (year = now.getFullYear());

		if (month.length < 2) month = '0' + month;
		if (day.length < 2) day = '0' + day;

		start_date = [year, month, day].join('-');
		end_date = [year, month, day].join('-');
	});

	$: filteredItems = $incidences?.filter(
		(incidence) => incidence.start_date.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
	);

	async function createIncidence() {
		if (edit) {
			return editIncidence();
		}
		try {
			const maxUser = await db.user.orderBy('counter').last();
			let maxCounter = 0;
			if (maxUser?.counter !== undefined) {
				maxCounter = maxUser?.counter;
			}

			await db.incidence.add({
				user_id: user_id,
				start_date: start_date,
				end_date: end_date
			});

			$toastMessageSuccess = `Incidence created successfully`;
			$toastSuccess = true;
			setTimeout(() => {
				$toastSuccess = false;
			}, 8000);
		} catch (error) {
			$toastMessageAlert = `Failed to create incidence: ${error}`;
			$toastAlert = true;
			setTimeout(() => {
				$toastAlert = false;
			}, 8000);
		} finally {
			user_id = 0;
			currentDate();
		}
	}

	async function editIncidence() {
		db.incidence.update(selectedId, {
			user_id: user_id,
			start_date: start_date,
			end_date: end_date
		});
		$toastMessageSuccess = 'Incidence modified successfully';
		$toastSuccess = true;
		setTimeout(() => {
			$toastSuccess = false;
		}, 8000);
		user_id = 0;
		currentDate();
		edit = false;
	}

	async function deleteIncidence() {
		await db.incidence.delete(selectedId);
		$toastMessageSuccess = 'Incidence deleted successfully';
		$toastSuccess = true;
		setTimeout(() => {
			$toastSuccess = false;
		}, 8000);
	}

	function currentDate() {
		(month = '' + (now.getMonth() + 1)), (day = '' + now.getDate()), (year = now.getFullYear());

		if (month.length < 2) month = '0' + month;
		if (day.length < 2) day = '0' + day;

		start_date = [year, month, day].join('-');
		end_date = [year, month, day].join('-');
	}
</script>

<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto">
	<Card size="xl">
		<Button
			color="blue"
			class="mt-1 mb-4"
			on:click={() => {
				createModal = true;
				edit = false;
				user_id = 0;
				currentDate();
			}}>Create new Incidence</Button
		>
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
								<TableBodyCell>{userList[incidence.user_id]}</TableBodyCell>
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
											user_id = incidence.user_id;
											start_date = incidence.start_date;
											end_date = incidence.end_date;
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
			<Select id="publisher" bind:value={user_id} items={userSelect} required />
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

	<Modal bind:open={deleteModal} size="xs" autoclose outsideclose>
		<div class="text-center">
			<ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
			<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
				Are you sure you want to delete this incidence?
			</h3>
			<Button color="red" class="me-2" on:click={deleteIncidence}>Yes, I'm sure</Button>
			<Button color="alternative">No, cancel</Button>
		</div>
	</Modal>
</div>
