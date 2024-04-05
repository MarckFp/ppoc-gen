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
		TableBodyRow
	} from 'flowbite-svelte';
	import { SearchSolid, ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import Timepicker from '$lib/components/Timepicker.svelte';
	import Datepicker from '$lib/components/Datepicker.svelte';
	import { db } from '$lib/db';
	import { toastMessageSuccess, toastSuccess, toastMessageAlert, toastAlert } from '$lib/store';
	import { liveQuery } from 'dexie';

	let createModal = false;
	let deleteModal = false;
	let edit = false;
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

			selected_weekday = 'monday';
			start_time = '00:00';
			end_time = '00:00';
			n_carts = 1;
			location = '';
			n_brothers = 1;
			n_sisters = 1;
		} catch (error) {
			$toastMessageAlert = `Failed to create schedule: ${error}`;
			$toastAlert = true;
			setTimeout(() => {
				$toastAlert = false;
			}, 8000);
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
		<div class="flex flex-row justify-between">
			<div class="flex flex-row">
				<Datepicker />
				<Button class="ml-2"><SearchSolid /></Button>
			</div>
			<Button
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
		</div>
		{#if $schedules}
			{#if $schedules.length == 0}
				<Card size="xl" class="mt-5">
					<h1 class="text-center">No schedules yet</h1>
				</Card>
			{:else}
				<Card size="xl" class="mt-5 grid grid-cols-2 gap-3">
					{#each $schedules as schedule}
						<Card class="mt-2 mb-2 max-w-full">
							<div class="flex flex-row justify-between">
								<Button
									color="blue"
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
									id="delete-{schedule.id}"
									on:click={() => {
										deleteModal = true;
										selectedId = schedule.id;
									}}>Delete</Button
								>
							</div>
							<Table striped={true}>
								<TableBody>
									<TableBodyRow>
										<TableBodyCell>Weekday</TableBodyCell>
										<TableBodyCell
											>{schedule.weekday.charAt(0).toUpperCase() +
												schedule.weekday.slice(1)}</TableBodyCell
										>
									</TableBodyRow>
									<TableBodyRow>
										<TableBodyCell>Start Time</TableBodyCell>
										<TableBodyCell>{schedule.start_time}</TableBodyCell>
									</TableBodyRow>
									<TableBodyRow>
										<TableBodyCell>End Time</TableBodyCell>
										<TableBodyCell>{schedule.end_time}</TableBodyCell>
									</TableBodyRow>
									<TableBodyRow>
										<TableBodyCell>Location</TableBodyCell>
										<TableBodyCell>{schedule.location}</TableBodyCell>
									</TableBodyRow>
									<TableBodyRow>
										<TableBodyCell>Nº Carts</TableBodyCell>
										<TableBodyCell>{schedule.n_carts}</TableBodyCell>
									</TableBodyRow>
									<TableBodyRow>
										<TableBodyCell>Nº Brothers</TableBodyCell>
										<TableBodyCell>{schedule.n_brothers}</TableBodyCell>
									</TableBodyRow>
									<TableBodyRow>
										<TableBodyCell>Nº Sisters</TableBodyCell>
										<TableBodyCell>{schedule.n_sisters}</TableBodyCell>
									</TableBodyRow>
								</TableBody>
							</Table>
						</Card>
					{/each}
				</Card>
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
