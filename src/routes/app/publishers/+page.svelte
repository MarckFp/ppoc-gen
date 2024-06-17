<script lang="ts">
	import {
		Card,
		Input,
		Button,
		Modal,
		Label,
		Select,
		MultiSelect,
		Checkbox,
		Radio,
		Badge,
		Tooltip,
		Dropdown,
		Search,
		DropdownItem,
		TableSearch,
		TableHead,
		TableHeadCell,
		TableBody,
		TableBodyRow,
		TableBodyCell
	} from 'flowbite-svelte'
	import {DotsHorizontalOutline, ExclamationCircleOutline, InfoCircleSolid} from 'flowbite-svelte-icons'
	import AlertToast from '$lib/components/AlertToast.svelte'
	import {db} from '$lib/db'
	import {liveQuery} from 'dexie'
	import {_} from 'svelte-i18n'
	import {onMount} from 'svelte'
	import {nameOrder, weekOrder, mobile} from '$lib/stores'

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
		query_name_order = 'firstname+lastname',
		weight: number = 1,
		pubAffinities: number[],
		availabilities: boolean[] = [],
		affinityList: {value: number; name: string; color: string}[] = [],
		modalTitle: string = $_('general.create-btn'),
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
				value: 2,
				name: $_('publishers.medium')
			},
			{
				value: 3,
				name: $_('publishers.low')
			}
		]

	let sunday = 7

	if ($weekOrder == 'monday') {
		sunday = 7
	} else if ($weekOrder == 'sunday') {
		sunday = 0
	}

	if ($nameOrder == 'firstname') {
		query_name_order = 'firstname+lastname'
	} else if ($nameOrder == 'lastname') {
		query_name_order = 'lastname+firstname'
	}

	let sorter = {
		monday: 1,
		tuesday: 2,
		wednesday: 3,
		thursday: 4,
		friday: 5,
		saturday: 6,
		sunday: sunday
	}

	onMount(async () => {
		db.user.orderBy(`[${query_name_order}]`).each(user => {
			if (user.id != undefined) {
				if ($nameOrder == 'firstname') {
					if (user.gender == 'male') {
						affinityList.push({value: user.id, name: user.firstname + ' ' + user.lastname, color: 'blue'})
					} else {
						affinityList.push({value: user.id, name: user.firstname + ' ' + user.lastname, color: 'pink'})
					}
				} else if ($nameOrder == 'lastname') {
					if (user.gender == 'male') {
						affinityList.push({value: user.id, name: user.lastname + ' ' + user.firstname, color: 'blue'})
					} else {
						affinityList.push({value: user.id, name: user.lastname + ' ' + user.firstname, color: 'pink'})
					}
				}
			}
		})
	})

	$: users = liveQuery(() => db.user.orderBy(`[${query_name_order}]`).toArray())
	let schedules = liveQuery(() => db.schedule.toArray())
	let affinities = liveQuery(() => db.affinity.toArray())

	$: filteredItems = $users?.filter(user => {
		if ($nameOrder == 'firstname') {
			return (
				user.firstname
					.toLowerCase()
					.normalize('NFD')
					.replace(/\p{Diacritic}/gu, '')
					.indexOf(
						searchTerm
							.toLowerCase()
							.normalize('NFD')
							.replace(/\p{Diacritic}/gu, '')
					) !== -1
			)
		} else if ($nameOrder == 'lastname') {
			return (
				user.lastname
					.toLowerCase()
					.normalize('NFD')
					.replace(/\p{Diacritic}/gu, '')
					.indexOf(
						searchTerm
							.toLowerCase()
							.normalize('NFD')
							.replace(/\p{Diacritic}/gu, '')
					) !== -1
			)
		}
	})

	$: $schedules?.sort(function sortByDay(a, b) {
		let day1 = a.weekday
		let day2 = b.weekday
		return sorter[day1] - sorter[day2]
	})

	async function createPublisher() {
		if (firstname == '' || lastname == '' || weight < 1 || weight > 4) {
			firstname = ''
			lastname = ''
			gender = 'male'
			weight = 1
			advanced = false
			advanced_radio = 'no'
			availabilities = []
			pubAffinities = []

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('general.invalid-data')}
			})
			return
		}
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

			if (pubAffinities.length > 0) {
				pubAffinities.forEach(async affinity_id => {
					await db.affinity.add({
						source_id: id,
						destination_id: affinity_id
					})

					await db.affinity.add({
						source_id: affinity_id,
						destination_id: id
					})
				})
			}

			if ($nameOrder == 'firstname') {
				if (gender == 'male') {
					affinityList.push({value: id, name: firstname + ' ' + lastname, color: 'blue'})
				} else {
					affinityList.push({value: id, name: firstname + ' ' + lastname, color: 'pink'})
				}
			} else if ($nameOrder == 'lastname') {
				if (gender == 'male') {
					affinityList.push({value: id, name: lastname + ' ' + firstname, color: 'blue'})
				} else {
					affinityList.push({value: id, name: lastname + ' ' + firstname, color: 'pink'})
				}
			}

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'success', alertMessage: $_('publishers.pub-create')}
			})
		} catch (error) {
			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('publishers.pub-create-failed') + error}
			})
		} finally {
			firstname = ''
			lastname = ''
			gender = 'male'
			weight = 1
			advanced = false
			advanced_radio = 'no'
			availabilities = []
			pubAffinities = []
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

		const publisherAffinities = await db.affinity.where({source_id: selectedId}).toArray()
		publisherAffinities.forEach(async affinity => {
			await db.affinity.delete(affinity.id)
		})

		const affinitiesPublishers = await db.affinity.where({destination_id: selectedId}).toArray()
		affinitiesPublishers.forEach(async affinity => {
			await db.affinity.delete(affinity.id)
		})

		if (pubAffinities.length > 0) {
			pubAffinities.forEach(async affinity_id => {
				await db.affinity.add({
					source_id: selectedId,
					destination_id: affinity_id
				})

				await db.affinity.add({
					source_id: affinity_id,
					destination_id: selectedId
				})
			})
		}

		affinityList.forEach(item => {
			if (item.value == selectedId) {
				if ($nameOrder == 'firstname') {
					item.name = firstname + ' ' + lastname
				} else if ($nameOrder == 'lastname') {
					item.name = lastname + ' ' + firstname
				}
				if (gender == 'male') {
					item.color = 'blue'
				} else if (gender == 'female') {
					item.color = 'pink'
				}
			}
		})

		new AlertToast({
			target: document.querySelector('#toast-container'),
			props: {alertStatus: 'success', alertMessage: $_('publishers.pub-modified')}
		})
		firstname = ''
		lastname = ''
		gender = 'male'
		weight = 1
		advanced = false
		advanced_radio = 'no'
		availabilities = []
		pubAffinities = []
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

		const publisherAffinities = await db.affinity.where({source_id: selectedId}).toArray()
		publisherAffinities.forEach(async affinity => {
			await db.affinity.delete(affinity.id)
		})

		const affinitiesPublishers = await db.affinity.where({destination_id: selectedId}).toArray()
		affinitiesPublishers.forEach(async affinity => {
			await db.affinity.delete(affinity.id)
		})

		affinityList.forEach((item, index) => {
			if (item.value == selectedId) {
				affinityList.splice(index, 1)
			}
		})

		new AlertToast({
			target: document.querySelector('#toast-container'),
			props: {alertStatus: 'success', alertMessage: $_('publishers.pub-deleted')}
		})
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

	//TODO: Apparently this have a bug. Flowbite Svelte Multiselect doesn't allow bing:items so the items don't change even if we delete a user
	function getAffinities(user_id: number) {
		pubAffinities = []
		for (let affinity of $affinities) {
			if (affinity.source_id == user_id) {
				pubAffinities.push(affinity.destination_id)
			}
		}
	}
</script>

<svelte:head>
	<title>PPOC Gen - {$_('navbar.publishers')}</title>
</svelte:head>

<section class="mx-auto flex flex-col items-center justify-center px-6 py-8">
	<Card size="xl">
		<div class="grid grid-cols-1 gap-3">
			{#if $mobile}
				<div class="mt-1">
					<Search size="md" bind:value={searchTerm} placeholder={$_('publishers.search-inp')} />
				</div>
			{/if}
			<Button
				color="blue"
				class="mb-4 mt-1"
				data-testid="publishers-create-btn"
				on:click={() => {
					createModal = true
					edit = false
					firstname = ''
					lastname = ''
					gender = 'male'
					availabilities = []
					weight = 1
					modalTitle = $_('general.create-btn')
				}}>{$_('publishers.create-btn')}</Button
			>
		</div>
		{#if $users}
			{#if $users.length == 0}
				<Card size="xl" class="mt-5">
					<h1 class="text-center dark:text-white">{$_('publishers.no-publishers')}</h1>
				</Card>
			{:else if $mobile}
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-4">
					{#each filteredItems as user}
						<Card padding="none" class="p-2" size="xl">
							<div class="flex justify-end">
								<DotsHorizontalOutline />
								<Dropdown class="p-1">
									<DropdownItem
										id="edit-{user.id}"
										data-testid="publishers-edit-btn"
										on:click={() => {
											createModal = true
											advanced = false
											advanced_radio = 'no'
											selectedId = user.id
											firstname = user.firstname
											lastname = user.lastname
											gender = user.gender
											weight = user.weight
											modalTitle = $_('general.edit-btn')
											if (![1, 2, 3].includes(weight)) {
												advanced = true
												advanced_radio = 'yes'
											}
											getAffinities(user.id)
											retrieveAvailabilities(user.id)
											edit = true
										}}
									>
										{$_('general.edit-btn')}
									</DropdownItem>
									<DropdownItem
										id="delete-{user.id}"
										on:click={() => {
											deleteModal = true
											selectedId = user.id
										}}
										>{$_('general.delete-btn')}
									</DropdownItem>
								</Dropdown>
							</div>
							<div class="flex flex-col items-center text-center">
								{#if $nameOrder == 'lastname'}
									<h5 class="w-full text-xl font-medium text-gray-900 dark:text-white">
										{user.lastname + ' ' + user.firstname}
									</h5>
								{:else}
									<h5 class="w-full text-xl font-medium text-gray-900 dark:text-white">
										{user.firstname + ' ' + user.lastname}
									</h5>
								{/if}
								<div class="mt-2 w-full">
									<div class="grid h-fit grid-cols-2 gap-4">
										{#if user.gender == 'male'}
											<Badge large color="blue">{$_('general.' + user.gender)}</Badge>
										{:else}
											<Badge large color="pink">{$_('general.' + user.gender)}</Badge>
										{/if}
										{#if user.weight == 1}
											<Badge large color="yellow">{$_('publishers.high')}</Badge>
										{:else if user.weight == 2}
											<Badge large color="indigo">{$_('publishers.medium')}</Badge>
										{:else if user.weight == 3}
											<Badge large color="green">{$_('publishers.low')}</Badge>
										{:else}
											<Badge large color="red">{$_('publishers.advanced')}: {user.weight}</Badge>
										{/if}
									</div>
								</div>
							</div>
						</Card>
					{/each}
				</div>
			{:else}
				<TableSearch
					placeholder={$nameOrder == 'firstname' ? $_('publishers.search-inp') : $_('publishers.search-inp-lastname')}
					striped={true}
					hoverable={true}
					bind:inputValue={searchTerm}
				>
					<TableHead>
						{#if $nameOrder == 'lastname'}
							<TableHeadCell>{$_('publishers.lastname')} & {$_('publishers.firstname')}</TableHeadCell>
						{:else}
							<TableHeadCell>{$_('publishers.firstname')} & {$_('publishers.lastname')}</TableHeadCell>
						{/if}
						<TableHeadCell>{$_('publishers.gender')}</TableHeadCell>
						<TableHeadCell>{$_('publishers.priority')}</TableHeadCell>
						<TableHeadCell>
							<span class="sr-only">Actions</span>
						</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each filteredItems as user}
							<TableBodyRow>
								{#if $nameOrder == 'lastname'}
									<TableBodyCell>{user.lastname + ' ' + user.firstname}</TableBodyCell>
								{:else}
									<TableBodyCell>{user.firstname + ' ' + user.lastname}</TableBodyCell>
								{/if}
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
									{:else if user.weight == 2}
										<Badge large border color="indigo">{$_('publishers.medium')}</Badge>
									{:else if user.weight == 3}
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
										data-testid="publishers-edit-btn"
										on:click={() => {
											createModal = true
											advanced = false
											advanced_radio = 'no'
											selectedId = user.id
											firstname = user.firstname
											lastname = user.lastname
											gender = user.gender
											weight = user.weight
											modalTitle = $_('general.edit-btn')
											if (![1, 2, 3].includes(weight)) {
												advanced = true
												advanced_radio = 'yes'
											}
											getAffinities(user.id)
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

	<Modal title={modalTitle} bind:open={createModal} size="lg" autoclose outsideclose class="mb-6">
		<Label>
			{$_('publishers.firstname')}:
			<Input type="text" id="firstname" bind:value={firstname} data-testid="publishers-firstname" required />
		</Label>
		<Label>
			{$_('publishers.lastname')}:
			<Input type="text" id="lastname" bind:value={lastname} data-testid="publishers-lastname" required />
		</Label>
		<Label>
			{$_('publishers.gender')}:
			<Select class="mt-2" id="gender" items={genders} bind:value={gender} data-testid="publishers-gender" required />
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
							data-testid="publishers-weight-{name}"
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
						data-testid="publishers-weight-advanced"
						on:change={() => {
							advanced = true
						}}
						class="p-3">{$_('publishers.advanced')}</Radio
					>
				</li>
			</ul>
			{#if advanced}
				<Input
					type="number"
					id="weight"
					min="1"
					max="10"
					step=".1"
					bind:value={weight}
					class="mt-2"
					data-testid="publishers-weight-advanced-input"
					required
				/>
			{/if}
		</Label>
		<Label>
			<div class="flex flex-row">
				<Tooltip triggeredBy="#info-affinity">{$_('publishers.info-affinity')}</Tooltip>
				<InfoCircleSolid id="info-affinity" class="mr-2" />
				{$_('publishers.affinity')}:
			</div>
			<MultiSelect items={affinityList} bind:value={pubAffinities} size="sm" let:item let:clear class="mt-1">
				<Badge color={item.color} dismissable params={{duration: 100}} on:close={clear}>
					{item.name}
				</Badge>
			</MultiSelect>
		</Label>
		<Label>
			{$_('publishers.availability')}:
			{#if $schedules}
				{#if $schedules.length == 0}
					<p class="m-1 text-center">{$_('publishers.no-schedules')}</p>
				{:else}
					<ul
						class="m-1 grid w-full grid-cols-1 items-center gap-2 rounded-lg sm:grid-cols-2"
						data-testid="publishers-availability"
					>
						{#each $schedules as schedule}
							{#if schedule.id}
								<li class="w-full rounded border">
									<Checkbox class="p-3" id="availability-{schedule.id}" bind:checked={availabilities[schedule.id]}
										><Badge rounded color="red" class="m-1">{$_('general.' + schedule.weekday)}</Badge><Badge
											rounded
											color="indigo">{schedule.start_time + '-' + schedule.end_time}</Badge
										><Badge rounded class="m-1" color="pink">{schedule.location}</Badge></Checkbox
									>
								</li>
							{/if}
						{/each}
					</ul>
				{/if}
			{/if}
		</Label>
		<div class="text-center">
			<Button color="red" class="me-2" on:click={createPublisher} data-testid="publishers-create-submit">
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
</section>
