<script lang="ts">
	import {
		Card,
		Button,
		Modal,
		Label,
		Input,
		Select,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHeadCell,
		TableSearch,
		TableHead
	} from 'flowbite-svelte';
	import { ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import Timepicker from '$lib/components/Timepicker.svelte';
	import { db } from '$lib/db';
	import { toastMessageSuccess, toastSuccess, toastMessageAlert, toastAlert } from '$lib/store';
	import { liveQuery } from 'dexie';

	let createModal = false;
	let deleteModal = false;
	let edit = false;
	let searchTerm = '';
	let selected_weekday = 'monday';
	let start_time = '00:00';
	let end_time = '00:00';
	let n_carts = 1;
	let location = '';
	let n_brothers = 1;
	let n_sisters = 1;
	let selectedId: number;
	let weekdays = [
		{ value: 'monday', name: 'Monday' },
		{ value: 'tuesday', name: 'Tuesday' },
		{ value: 'wednesday', name: 'Wednesday' },
		{ value: 'thursday', name: 'Thursday' },
		{ value: 'friday', name: 'Friday' },
		{ value: 'saturday', name: 'Saturday' },
		{ value: 'sunday', name: 'Sunday' }
	];

	let schedules = liveQuery(() => db.schedule.toArray());
	$: filteredItems = $schedules?.filter(
		(schedule) => schedule.weekday.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
	);

	//TODO: Add a check to see if we've exceeded the nº of carts for the congregation in a schedule
	async function createSchedule() {
		if (edit) {
			return editSchedule();
		}
		try {
			const id = await db.schedule.add({
				weekday: selected_weekday,
				start_time: start_time,
				end_time: end_time,
				n_carts: n_carts,
				location: location,
				n_brothers: n_brothers,
				n_sisters: n_sisters
			});

			$toastMessageSuccess = 'Schedule created successfully';
			$toastSuccess = true;
			setTimeout(() => {
				$toastSuccess = false;
			}, 8000);
		} catch (error) {
			$toastMessageAlert = `Failed to create schedule: ${error}`;
			$toastAlert = true;
			setTimeout(() => {
				$toastAlert = false;
			}, 8000);
		} finally {
			selected_weekday = 'monday';
			start_time = '00:00';
			end_time = '00:00';
			n_carts = 1;
			location = '';
			n_brothers = 1;
			n_sisters = 1;
		}
	}

	async function deleteSchedule() {
		await db.schedule.delete(selectedId);
		$toastMessageSuccess = 'Schedule deleted successfully';
		$toastSuccess = true;
		setTimeout(() => {
			$toastSuccess = false;
		}, 8000);
	}

	function editSchedule() {
		db.schedule.update(selectedId, {
			weekday: selected_weekday,
			start_time: start_time,
			end_time: end_time,
			n_carts: n_carts,
			location: location,
			n_brothers: n_brothers,
			n_sisters: n_sisters
		});
		$toastMessageSuccess = 'Schedule modified successfully';
		$toastSuccess = true;
		setTimeout(() => {
			$toastSuccess = false;
		}, 8000);
		selected_weekday = 'monday';
		start_time = '00:00';
		end_time = '00:00';
		n_carts = 1;
		location = '';
		n_brothers = 1;
		n_sisters = 1;
		edit = false;
	}
</script>

<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto">
	<Card size="xl">
		<Button
			color="blue"
			class="mt-1 mb-4"
			on:click={() => {
				createModal = true;
				selected_weekday = 'monday';
				start_time = '00:00';
				end_time = '00:00';
				n_carts = 1;
				location = '';
				n_brothers = 1;
				n_sisters = 1;
				edit = false;
			}}>Create new Schedule</Button
		>
		{#if $schedules}
			{#if $schedules.length == 0}
				<Card size="xl" class="mt-5">
					<h1 class="text-center">No schedules yet</h1>
				</Card>
			{:else}
				<TableSearch
					placeholder="Search by Weekday"
					striped={true}
					hoverable={true}
					bind:inputValue={searchTerm}
				>
					<TableHead>
						<TableHeadCell>WeekDay</TableHeadCell>
						<TableHeadCell>Start Time</TableHeadCell>
						<TableHeadCell>End Time</TableHeadCell>
						<TableHeadCell>Location</TableHeadCell>
						<TableHeadCell>Nº of Carts</TableHeadCell>
						<TableHeadCell>Nº of Brothers</TableHeadCell>
						<TableHeadCell>Nº of Sisters</TableHeadCell>
						<TableHeadCell>
							<span class="sr-only">Actions</span>
						</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each filteredItems as schedule}
							<TableBodyRow>
								<TableBodyCell
									>{schedule.weekday.charAt(0).toUpperCase() +
										schedule.weekday.slice(1)}</TableBodyCell
								>
								<TableBodyCell>{schedule.start_time}</TableBodyCell>
								<TableBodyCell>{schedule.end_time}</TableBodyCell>
								<TableBodyCell>{schedule.location}</TableBodyCell>
								<TableBodyCell>{schedule.n_carts}</TableBodyCell>
								<TableBodyCell>{schedule.n_brothers}</TableBodyCell>
								<TableBodyCell>{schedule.n_sisters}</TableBodyCell>
								<TableBodyCell>
									<Button
										color="blue"
										class="mr-2"
										id="edit-{schedule.id}"
										on:click={() => {
											createModal = true;
											selectedId = schedule.id;
											edit = true;
											selected_weekday = schedule.weekday;
											n_brothers = schedule.n_brothers;
											n_sisters = schedule.n_sisters;
											n_carts = schedule.n_carts;
											location = schedule.location;
											start_time = schedule.start_time;
											end_time = schedule.end_time;
										}}>Edit</Button
									>
									<Button
										color="red"
										class="ml-2"
										id="delete-{schedule.id}"
										on:click={() => {
											deleteModal = true;
											selectedId = schedule.id;
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
			Weekday:
			<Select class="mt-2" items={weekdays} bind:value={selected_weekday} />
		</Label>
		<Label>
			Start Time:
			<Timepicker bind:selectedTime={start_time} />
		</Label>
		<Label>
			End Time:
			<Timepicker bind:selectedTime={end_time} />
		</Label>
		<Label>
			Location:
			<Input type="text" id="location" bind:value={location} required />
		</Label>
		<Label>
			Number of Carts:
			<Input type="number" id="n_carts" min="1" bind:value={n_carts} required />
		</Label>
		<div class="grid gap-6 mb-6 md:grid-cols-2">
			<div>
				<Label for="n_brothers" class="mb-2">Number of Brothers:</Label>
				<Input type="number" id="n_brothers" bind:value={n_brothers} required />
			</div>
			<div>
				<Label for="n_sisters" class="mb-2">Number of Sisters:</Label>
				<Input type="number" id="n_sisters" bind:value={n_sisters} required />
			</div>
		</div>
		<div class="text-center">
			<Button color="red" class="me-2" on:click={createSchedule}>
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
				Are you sure you want to delete this schedule?
			</h3>
			<Button color="red" class="me-2" on:click={deleteSchedule}>Yes, I'm sure</Button>
			<Button color="alternative">No, cancel</Button>
		</div>
	</Modal>
</div>
