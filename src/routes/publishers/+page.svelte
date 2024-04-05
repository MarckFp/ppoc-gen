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
	let users = liveQuery(() => db.user.toArray());

	$: filteredItems = $users?.filter(
		(user) => user.firstname.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
	);

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

			await db.user.add({
				firstname: firstname,
				lastname: lastname,
				gender: gender,
				weight: weight,
				counter: maxCounter
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
		}
	}

	async function editUser() {
		db.user.update(selectedId, {
			firstname: firstname,
			lastname: lastname,
			gender: gender,
			weight: weight
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
		edit = false;
	}

	async function deleteUser() {
		await db.user.delete(selectedId);
		$toastMessageSuccess = 'Publisher deleted successfully';
		$toastSuccess = true;
		setTimeout(() => {
			$toastSuccess = false;
		}, 8000);
	}
</script>

<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto">
	<Card size="xl">
		<Button
			color="blue"
			class="mt-1 mb-4"
			on:click={() => {
				createModal = true;
				firstname = '';
				lastname = '';
				gender = 'male';
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
					placeholder="Search by publisher name"
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
