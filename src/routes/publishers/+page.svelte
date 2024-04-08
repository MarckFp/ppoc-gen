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
		TableHeadCell,
		Checkbox,
		Badge
	} from 'flowbite-svelte';
	import { SearchSolid, ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import { db } from '$lib/db';
	import { liveQuery } from 'dexie';
	import { toastMessageSuccess, toastSuccess, toastMessageAlert, toastAlert } from '$lib/store';

	let createModal = false;
	let deleteModal = false;
	let edit = false;
	let selectedId: number;
	let searchTerm = '';
	let firstname = '';
	let lastname = '';
	let gender = 'male';
	let weight = 1;
	let genders = [
		{ value: 'male', name: 'Male' },
		{ value: 'female', name: 'Female' }
	];
	let availabilities: boolean[] = [];
	let users = liveQuery(() => db.user.toArray());
	let schedules = liveQuery(() => db.schedule.toArray());

	$: filteredItems = $users?.filter(
		(user) => user.firstname.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
	);

	//TODO: Rework weight with range or radio and change name to importance so the UX is more legible
	async function createPublisher() {
		if (edit) {
			return editUser();
		}
		try {
			const maxUser = await db.user.orderBy('counter').last();
			let maxCounter = 0;
			if (maxUser?.counter !== undefined) {
				maxCounter = maxUser?.counter;
			}

			const id = await db.user.add({
				firstname: firstname,
				lastname: lastname,
				gender: gender,
				weight: weight,
				counter: maxCounter
			});

			availabilities.forEach(async (availability, availability_id) => {
				if (availability) {
					await db.availability.add({
						user_id: id,
						schedule_id: availability_id
					});
				}
			});

			$toastMessageSuccess = `Publisher ${firstname + ' ' + lastname} created successfully`;
			$toastSuccess = true;
			setTimeout(() => {
				$toastSuccess = false;
			}, 8000);
		} catch (error) {
			$toastMessageAlert = `Failed to create publisher: ${error}`;
			$toastAlert = true;
			setTimeout(() => {
				$toastAlert = false;
			}, 8000);
		} finally {
			firstname = '';
			lastname = '';
			gender = 'male';
			weight = 1;
			availabilities = [];
		}
	}

	async function editUser() {
		db.user.update(selectedId, {
			firstname: firstname,
			lastname: lastname,
			gender: gender,
			weight: weight
		});

		const availability_list = await db.availability.where({user_id: selectedId}).toArray();
		availability_list.forEach(async (availability) => {
			await db.availability.delete(availability.id);
		});

		availabilities.forEach(async (availability, availability_id) => {
			if (availability) {
				await db.availability.add({
					user_id: selectedId,
					schedule_id: availability_id
				});
			}
		});

		$toastMessageSuccess = 'User modified successfully';
		$toastSuccess = true;
		setTimeout(() => {
			$toastSuccess = false;
		}, 8000);
		firstname = '';
		lastname = '';
		gender = 'male';
		weight = 1;
		availabilities = [];
		edit = false;
	}

	async function deleteUser() {
		await db.user.delete(selectedId);
		const availability_list = await db.availability.where({user_id: selectedId}).toArray();
		availability_list.forEach(async (availability) => {
			await db.availability.delete(availability.id);
		});

		$toastMessageSuccess = 'Publisher deleted successfully';
		$toastSuccess = true;
		setTimeout(() => {
			$toastSuccess = false;
		}, 8000);
	}

	async function retrieveAvailabilities(user_id: number) {
		availabilities = [];
		const availability_list = await db.availability.where({user_id: user_id}).toArray();
		if (availability_list.length == 0) {
			availabilities = [];
			return;
		}
		availability_list.forEach((availability) => {
			availabilities[availability.schedule_id] = true;
		});
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
				firstname = '';
				lastname = '';
				gender = 'male';
				availabilities = [];
				weight = 1;
			}}>Create new Publisher</Button
		>
		{#if $users}
			{#if $users.length == 0}
				<Card size="xl" class="mt-5">
					<h1 class="text-center">No Publishers yet</h1>
				</Card>
			{:else}
				<TableSearch
					placeholder="Search by Publisher name"
					striped={true}
					hoverable={true}
					bind:inputValue={searchTerm}
				>
					<TableHead>
						<TableHeadCell>Firstname</TableHeadCell>
						<TableHeadCell>Lastname</TableHeadCell>
						<TableHeadCell>Gender</TableHeadCell>
						<TableHeadCell>Weight</TableHeadCell>
						<TableHeadCell>
							<span class="sr-only">Actions</span>
						</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each filteredItems as user}
							<TableBodyRow>
								<TableBodyCell>{user.firstname}</TableBodyCell>
								<TableBodyCell>{user.lastname}</TableBodyCell>
								<TableBodyCell
									>{user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}</TableBodyCell
								>
								<TableBodyCell>{user.weight}</TableBodyCell>
								<TableBodyCell>
									<Button
										color="blue"
										class="mr-2"
										id="edit-{user.id}"
										on:click={() => {
											createModal = true;
											selectedId = user.id;
											firstname = user.firstname;
											lastname = user.lastname;
											gender = user.gender;
											weight = user.weight;
											retrieveAvailabilities(user.id);
											edit = true;
										}}>Edit</Button
									>
									<Button
										color="red"
										class="ml-2"
										id="delete-{user.id}"
										on:click={() => {
											deleteModal = true;
											selectedId = user.id;
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
			Firstname:
			<Input type="text" id="location" bind:value={firstname} required />
		</Label>
		<Label>
			Lastname:
			<Input type="text" id="location" bind:value={lastname} required />
		</Label>
		<Label>
			Gender:
			<Select class="mt-2" items={genders} bind:value={gender} />
		</Label>
		<Label>
			Weight:
			<Input type="number" id="n_carts" min="1" max="5" step=".1" bind:value={weight} required />
		</Label>
		<Label>
			Availability:
			{#if $schedules}
				{#if $schedules.length == 0}
					<p class="text-center">No schedules created yet</p>
				{:else}
					<ul class="items-center grid grid-cols-1 w-full rounded-lg">
						{#each $schedules as schedule}
							<li class="w-full border"><Checkbox class="p-3" bind:checked={availabilities[schedule.id]}><Badge color="red" class="m-1">{schedule.weekday.charAt(0).toUpperCase() + schedule.weekday.slice(1)}</Badge><Badge color="indigo">{schedule.start_time + '-' + schedule.end_time}</Badge><Badge class="m-1" color="pink">{schedule.location}</Badge></Checkbox></li>
						{/each}
					</ul>
				{/if}
			{/if}
		</Label>
		<div class="text-center">
			<Button color="red" class="me-2" on:click={createPublisher}>
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
				Are you sure you want to delete this publisher?
			</h3>
			<Button color="red" class="me-2" on:click={deleteUser}>Yes, I'm sure</Button>
			<Button color="alternative">No, cancel</Button>
		</div>
	</Modal>
</div>
