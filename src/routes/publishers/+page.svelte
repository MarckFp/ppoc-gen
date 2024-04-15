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
		Radio,
		Badge
	} from 'flowbite-svelte'
	import {ExclamationCircleOutline} from 'flowbite-svelte-icons'
	import {db} from '$lib/db'
	import {liveQuery} from 'dexie'
	import {toastMessageSuccess, toastSuccess, toastMessageAlert, toastAlert} from '$lib/store'
	import {_} from 'svelte-i18n'

	let createModal: boolean = false,
		deleteModal: boolean = false,
		advanced: boolean = false,
		edit: boolean = false,
		selectedId: number,
		searchTerm: string = '',
		firstname: string = '',
		lastname: string = '',
		gender: string = 'male',
		advanced_radio: string = 'no',
		weight: number = 1,
		availabilities: boolean[] = [],
		genders: {value: string; name: string}[] = [
			{value: 'male', name: $_('general.male')},
			{value: 'female', name: $_('general.female')}
		],
		weights = [
			{
				value: 1,
				name: $_('publishers.high')
			},
			{
				value: 1.5,
				name: $_('publishers.medium')
			},
			{
				value: 2,
				name: $_('publishers.low')
			}
		]
	let users = liveQuery(() => db.user.toArray())
	let schedules = liveQuery(() => db.schedule.toArray())

	$: filteredItems = $users?.filter(user => user.firstname.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)

	async function createPublisher() {
		if (edit) {
			return editUser()
		}
		try {
			const maxUser = await db.user.orderBy('counter').last()
			let maxCounter: number = 0
			if (maxUser?.counter !== undefined) {
				maxCounter = maxUser?.counter
			}

			const id = await db.user.add({
				firstname: firstname,
				lastname: lastname,
				gender: gender,
				weight: weight,
				counter: maxCounter
			})

			availabilities.forEach(async (availability, availability_id) => {
				if (availability) {
					await db.availability.add({
						user_id: id,
						schedule_id: availability_id
					})
				}
			})

			$toastMessageSuccess = $_('publishers.pub-create')
			$toastSuccess = true
			setTimeout(() => {
				$toastSuccess = false
			}, 8000)
		} catch (error) {
			$toastMessageAlert = $_('publishers.pub-create-failed') + error
			$toastAlert = true
			setTimeout(() => {
				$toastAlert = false
			}, 8000)
		} finally {
			firstname = ''
			lastname = ''
			gender = 'male'
			weight = 1
			advanced = false
			advanced_radio = 'no'
			availabilities = []
		}
	}

	async function editUser() {
		db.user.update(selectedId, {
			firstname: firstname,
			lastname: lastname,
			gender: gender,
			weight: weight
		})

		const availability_list = await db.availability.where({user_id: selectedId}).toArray()
		availability_list.forEach(async availability => {
			await db.availability.delete(availability.id)
		})

		availabilities.forEach(async (availability, availability_id) => {
			if (availability) {
				await db.availability.add({
					user_id: selectedId,
					schedule_id: availability_id
				})
			}
		})

		$toastMessageSuccess = $_('publishers.pub-modified')
		$toastSuccess = true
		setTimeout(() => {
			$toastSuccess = false
		}, 8000)
		firstname = ''
		lastname = ''
		gender = 'male'
		weight = 1
		advanced = false
		advanced_radio = 'no'
		availabilities = []
		edit = false
	}

	async function deleteUser() {
		await db.user.delete(selectedId)
		const availability_list = await db.availability.where({user_id: selectedId}).toArray()
		availability_list.forEach(async availability => {
			await db.availability.delete(availability.id)
		})
		const assignment_list = await db.assignment.where({user_id: selectedId}).toArray()
		assignment_list.forEach(async assignment => {
			await db.assignment.update(assignment.id, {user_id: -1})
		})

		$toastMessageSuccess = $_('publishers.pub-deleted')
		$toastSuccess = true
		setTimeout(() => {
			$toastSuccess = false
		}, 8000)
	}

	async function retrieveAvailabilities(user_id: number) {
		availabilities = []
		const availability_list = await db.availability.where({user_id: user_id}).toArray()
		if (availability_list.length == 0) {
			availabilities = []
			return
		}
		availability_list.forEach(availability => {
			availabilities[availability.schedule_id] = true
		})
	}
</script>

<div class="mx-auto flex flex-col items-center justify-center px-6 py-8">
	<Card size="xl">
		<Button
			color="blue"
			class="mb-4 mt-1"
			on:click={() => {
				createModal = true
				edit = false
				firstname = ''
				lastname = ''
				gender = 'male'
				availabilities = []
				weight = 1
			}}>{$_('publishers.create-btn')}</Button
		>
		{#if $users}
			{#if $users.length == 0}
				<Card size="xl" class="mt-5">
					<h1 class="text-center">{$_('publishers.no-publishers')}</h1>
				</Card>
			{:else}
				<TableSearch
					placeholder={$_('publishers.search-inp')}
					striped={true}
					hoverable={true}
					bind:inputValue={searchTerm}
				>
					<TableHead>
						<TableHeadCell>{$_('publishers.firstname')}</TableHeadCell>
						<TableHeadCell>{$_('publishers.lastname')}</TableHeadCell>
						<TableHeadCell>{$_('publishers.gender')}</TableHeadCell>
						<TableHeadCell>{$_('publishers.priority')}</TableHeadCell>
						<TableHeadCell>
							<span class="sr-only">Actions</span>
						</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each filteredItems as user}
							<TableBodyRow>
								<TableBodyCell>{user.firstname}</TableBodyCell>
								<TableBodyCell>{user.lastname}</TableBodyCell>
								<TableBodyCell>
									{#if user.gender == 'male'}
										<Badge large border rounded color="blue">{$_('general.' + user.gender)} ♂️</Badge>
									{:else}
										<Badge large border rounded color="pink">{$_('general.' + user.gender)} ♀️</Badge>
									{/if}
								</TableBodyCell>
								<TableBodyCell>
									{#if user.weight == 1}
										<Badge large border color="yellow">{$_('publishers.high')}</Badge>
									{:else if user.weight == 1.5}
										<Badge large border color="indigo">{$_('publishers.medium')}</Badge>
									{:else if user.weight == 2}
										<Badge large border color="red">{$_('publishers.low')}</Badge>
									{:else}
										<Badge large border color="pink">{$_('publishers.advanced')}: {user.weight}</Badge>
									{/if}
								</TableBodyCell>
								<TableBodyCell>
									<Button
										color="blue"
										class="mr-2"
										id="edit-{user.id}"
										on:click={() => {
											createModal = true
											advanced = false
											selectedId = user.id
											firstname = user.firstname
											lastname = user.lastname
											gender = user.gender
											weight = user.weight
											if (![1, 1.5, 2].includes(weight)) {
												advanced = true
												advanced_radio = 'yes'
											}
											retrieveAvailabilities(user.id)
											edit = true
										}}>{$_('general.edit-btn')}</Button
									>
									<Button
										color="red"
										class="ml-2"
										id="delete-{user.id}"
										on:click={() => {
											deleteModal = true
											selectedId = user.id
										}}>{$_('general.delete-btn')}</Button
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
			{$_('publishers.firstname')}:
			<Input type="text" id="firstname" bind:value={firstname} required />
		</Label>
		<Label>
			{$_('publishers.lastname')}:
			<Input type="text" id="lastname" bind:value={lastname} required />
		</Label>
		<Label>
			{$_('publishers.gender')}:
			<Select class="mt-2" id="gender" items={genders} bind:value={gender} />
		</Label>
		<Label>
			{$_('publishers.priority')}:
			<ul
				class="mb-2 w-full items-center divide-x divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-600 dark:border-gray-600 dark:bg-gray-800 sm:flex rtl:divide-x-reverse"
			>
				{#each weights as { value, name }}
					<li class="w-full">
						<Radio
							name="weight"
							bind:group={weight}
							{value}
							on:change={() => {
								advanced = false
							}}
							class="p-3">{name}</Radio
						>
					</li>
				{/each}
				<li class="w-full">
					<Radio
						name="weight"
						value="yes"
						group={advanced_radio}
						on:change={() => {
							advanced = true
						}}
						class="p-3">{$_('publishers.advanced')}</Radio
					>
				</li>
			</ul>
			{#if advanced}
				<Input type="number" id="weight" min="1" max="4" step=".1" bind:value={weight} class="mt-2" required />
			{/if}
		</Label>
		<Label>
			{$_('publishers.availability')}:
			{#if $schedules}
				{#if $schedules.length == 0}
					<p class="text-center">{$_('publishers.no-schedules')}</p>
				{:else}
					<ul class="grid w-full grid-cols-1 items-center rounded-lg">
						{#each $schedules as schedule}
							{#if schedule.id}
								<li class="w-full border">
									<Checkbox class="p-3" id="availability-{schedule.id}" bind:checked={availabilities[schedule.id]}
										><Badge color="red" class="m-1">{$_('general.' + schedule.weekday)}</Badge><Badge color="indigo"
											>{schedule.start_time + '-' + schedule.end_time}</Badge
										><Badge class="m-1" color="pink">{schedule.location}</Badge></Checkbox
									>
								</li>
							{/if}
						{/each}
					</ul>
				{/if}
			{/if}
		</Label>
		<div class="text-center">
			<Button color="red" class="me-2" on:click={createPublisher}>
				{#if edit}
					{$_('general.edit-btn')}
				{:else}
					{$_('general.create-btn')}
				{/if}
			</Button>
			<Button color="alternative">{$_('general.cancel-btn')}</Button>
		</div>
	</Modal>

	<Modal bind:open={deleteModal} size="xs" autoclose outsideclose>
		<div class="text-center">
			<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />
			<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
				{$_('publishers.are-you-sure')}
			</h3>
			<Button color="red" class="me-2" on:click={deleteUser}>{$_('general.yes-sure')}</Button>
			<Button color="alternative">{$_('general.no-cancel')}</Button>
		</div>
	</Modal>
</div>
