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
		Search,
		Dropdown,
		DropdownItem,
		Badge
	} from 'flowbite-svelte'
	import {DotsHorizontalOutline, ExclamationCircleOutline} from 'flowbite-svelte-icons'
	import {db} from '$lib/db'
	import AlertToast from '$lib/components/AlertToast.svelte'
	import {liveQuery} from 'dexie'
	import {_} from 'svelte-i18n'

	let createModal: boolean = false,
		deleteModal: boolean = false,
		edit: boolean = false,
		mobile: boolean = false,
		selectedId: number,
		searchTerm: string = '',
		modalTitle: string = $_('general.create-btn'),
		user_id: number = 0,
		userSelect: {value: number; name: string}[] = [],
		userList: string[] = [],
		start_date: string = new Date().toISOString().split('T')[0],
		end_date: string = new Date().toISOString().split('T')[0]

	let incidences = liveQuery(() => db.incidence.orderBy('start_date').toArray())

	userSelect.push({value: -1, name: $_('incidences.all-cong')})
	db.user.orderBy('firstname').each(user => {
		userSelect.push({value: user.id, name: user.firstname + ' ' + user.lastname})
		userList[user.id] = user.firstname + ' ' + user.lastname
	})

	$: filteredItems = $incidences?.filter(
		incidence => incidence.start_date.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
	)

	//Remove past incidences
	db.incidence
		.orderBy('start_date')
		.toArray()
		.then(incidenceList => {
			for (let incidence of incidenceList) {
				if (
					new Date(incidence.start_date) < new Date(start_date) &&
					new Date(incidence.end_date) < new Date(start_date)
				) {
					db.incidence.delete(incidence.id)
				}
			}
		})

	async function createIncidence() {
		let from: Date = new Date(start_date),
			to: Date = new Date(end_date)

		if (from > to) {
			user_id = 0
			start_date = new Date().toISOString().split('T')[0]
			end_date = new Date().toISOString().split('T')[0]

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('turns.from-bigger-to')}
			})
			return
		}
		if (from.getTime() < new Date(new Date().toISOString().split('T')[0]).getTime()) {
			user_id = 0
			start_date = new Date().toISOString().split('T')[0]
			end_date = new Date().toISOString().split('T')[0]

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('incidences.past-incident')}
			})
			return
		}
		if (user_id == undefined || user_id == 0) {
			user_id = 0
			start_date = new Date().toISOString().split('T')[0]
			end_date = new Date().toISOString().split('T')[0]

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('general.invalid-data')}
			})
			return
		}
		if (edit) {
			return editIncidence()
		}
		try {
			await db.incidence.add({
				user_id: user_id,
				start_date: start_date,
				end_date: end_date
			})

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'success', alertMessage: $_('incidences.created')}
			})
		} catch (error) {
			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('incidences.failed') + error}
			})
		} finally {
			user_id = 0
			start_date = new Date().toISOString().split('T')[0]
			end_date = new Date().toISOString().split('T')[0]
		}
	}

	async function editIncidence() {
		db.incidence.update(selectedId, {
			user_id: user_id,
			start_date: start_date,
			end_date: end_date
		})
		new AlertToast({
			target: document.querySelector('#toast-container'),
			props: {alertStatus: 'success', alertMessage: $_('incidences.modified')}
		})
		user_id = 0
		start_date = new Date().toISOString().split('T')[0]
		end_date = new Date().toISOString().split('T')[0]
		edit = false
	}

	async function deleteIncidence() {
		await db.incidence.delete(selectedId)
		new AlertToast({
			target: document.querySelector('#toast-container'),
			props: {alertStatus: 'success', alertMessage: $_('incidences.deleted')}
		})
	}

	//Media Queries for Calendar View
	const mediaQuery = window.matchMedia('(width <= 600px)')
	mediaQuery.addEventListener('change', ({matches}) => {
		if (matches) {
			mobile = true
		} else {
			mobile = false
		}
	})
	if (mediaQuery.matches) {
		mobile = true
	} else {
		mobile = false
	}
</script>

<section class="mx-auto flex flex-col items-center justify-center px-6 py-8">
	<Card size="xl">
		<div class="grid grid-cols-1 gap-3">
			{#if mobile}
				<div class="mt-1">
					<Search size="md" bind:value={searchTerm} placeholder={$_('incidences.search-by')} />
				</div>
			{/if}
			<Button
				color="blue"
				class="mb-4 mt-1"
				data-testid="incidences-create-btn"
				on:click={() => {
					createModal = true
					edit = false
					user_id = 0
					start_date = new Date().toISOString().split('T')[0]
					end_date = new Date().toISOString().split('T')[0]
					modalTitle = $_('general.create-btn')
				}}>{$_('incidences.create-btn')}</Button
			>
		</div>
		{#if $incidences}
			{#if $incidences.length == 0}
				<Card size="xl" class="mt-5">
					<h1 class="text-center dark:text-white">{$_('incidences.no-incidences')}</h1>
				</Card>
			{:else if mobile}
				<div class="grid grid-cols-1 gap-2 md:grid-cols-4">
					{#each filteredItems as incidence}
						<Card padding="none" class="p-2" size="xl">
							<div class="flex justify-end">
								<DotsHorizontalOutline />
								<Dropdown class="p-1">
									<DropdownItem
										id="edit-{incidence.id}"
										on:click={() => {
											createModal = true
											selectedId = incidence.id
											user_id = incidence.user_id
											start_date = incidence.start_date
											end_date = incidence.end_date
											modalTitle = $_('general.edit-btn')
											edit = true
										}}
									>
										{$_('general.edit-btn')}
									</DropdownItem>
									<DropdownItem
										id="delete-{incidence.id}"
										on:click={() => {
											deleteModal = true
											selectedId = incidence.id
										}}
										>{$_('general.delete-btn')}
									</DropdownItem>
								</Dropdown>
							</div>
							<div class="flex flex-col items-center text-center">
								{#if incidence.user_id == -1}
									<h4 class="w-full text-xl font-medium text-gray-900 dark:text-white">{$_('incidences.all-cong')}</h4>
								{:else}
									<h4 class="w-full text-xl font-medium text-gray-900 dark:text-white">
										{userList[incidence.user_id]}
									</h4>
								{/if}
								<h5 class="w-ful mt-2 text-lg font-medium text-gray-900 dark:text-white">
									<Badge large color="blue">{incidence.start_date}</Badge> - <Badge large color="red"
										>{incidence.end_date}</Badge
									>
								</h5>
							</div>
						</Card>
					{/each}
				</div>
			{:else}
				<TableSearch
					placeholder={$_('incidences.search-by')}
					striped={true}
					hoverable={true}
					bind:inputValue={searchTerm}
				>
					<TableHead>
						<TableHeadCell>{$_('incidences.publisher')}</TableHeadCell>
						<TableHeadCell>{$_('incidences.start-date')}</TableHeadCell>
						<TableHeadCell>{$_('incidences.end-date')}</TableHeadCell>
						<TableHeadCell>
							<span class="sr-only">Actions</span>
						</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each filteredItems as incidence}
							<TableBodyRow>
								{#if incidence.user_id == -1}
									<TableBodyCell>{$_('incidences.all-cong')}</TableBodyCell>
								{:else}
									<TableBodyCell>{userList[incidence.user_id]}</TableBodyCell>
								{/if}
								<TableBodyCell>{incidence.start_date}</TableBodyCell>
								<TableBodyCell>{incidence.end_date}</TableBodyCell>
								<TableBodyCell>
									<Button
										color="blue"
										class="mr-2"
										id="edit-{incidence.id}"
										on:click={() => {
											createModal = true
											selectedId = incidence.id
											user_id = incidence.user_id
											start_date = incidence.start_date
											end_date = incidence.end_date
											modalTitle = $_('general.edit-btn')
											edit = true
										}}>{$_('general.edit-btn')}</Button
									>
									<Button
										color="red"
										class="ml-2"
										id="delete-{incidence.id}"
										on:click={() => {
											deleteModal = true
											selectedId = incidence.id
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

	<Modal title={modalTitle} bind:open={createModal} size="xs" autoclose outsideclose>
		<Label>
			{$_('incidences.publisher')}:
			<Select
				id="publisher"
				bind:value={user_id}
				items={userSelect}
				required
				data-testid="incidences-create-publisher"
			/>
		</Label>
		<Label>
			{$_('incidences.start-date')}:
			<Input type="date" id="start_date" bind:value={start_date} required data-testid="incidences-create-startDate" />
		</Label>
		<Label>
			{$_('incidences.end-date')}:
			<Input type="date" id="end_date" bind:value={end_date} required data-testid="incidences-create-endDate" />
		</Label>
		<div class="text-center">
			<Button color="red" class="me-2" on:click={createIncidence} data-testid="incidences-create-submit">
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
				{$_('incidences.are-you-sure')}
			</h3>
			<Button color="red" class="me-2" on:click={deleteIncidence}>{$_('general.yes-sure')}</Button>
			<Button color="alternative">{$_('general.no-cancel')}</Button>
		</div>
	</Modal>
</section>
