<script lang="ts">
	import {
		Card,
		Button,
		Modal,
		Label,
		Input,
		Select,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHeadCell,
		TableSearch,
		TableHead,
		Search,
		Dropdown,
		DropdownItem,
		Checkbox,
		CheckboxButton
	} from 'flowbite-svelte'
	import {ArrowRightOutline, CheckCircleSolid, ExclamationCircleOutline} from 'flowbite-svelte-icons'
	import {db} from '$lib/db'
	import AlertToast from '$lib/components/AlertToast.svelte'
	import {liveQuery} from 'dexie'
	import {_} from 'svelte-i18n'
	import {weekOrder, mobile} from '$lib/stores'

	let createModal: boolean = false,
		deleteModal: boolean = false,
		edit: boolean = false,
		bulk: boolean = false,
		searchTerm: string = '',
		selected_weekday: string = 'monday',
		start_time: string = '00:00',
		end_time: string = '00:00',
		modalTitle: string = $_('general.create-btn'),
		location: string = '',
		n_brothers: number = 1,
		n_sisters: number = 1,
		selectedId: number,
		sorter = {},
		weekdays: {value: string; name: string}[] = [
			{value: 'monday', name: $_('general.monday')},
			{value: 'tuesday', name: $_('general.tuesday')},
			{value: 'wednesday', name: $_('general.wednesday')},
			{value: 'thursday', name: $_('general.thursday')},
			{value: 'friday', name: $_('general.friday')},
			{value: 'saturday', name: $_('general.saturday')},
			{value: 'sunday', name: $_('general.sunday')}
		],
		toggleAllCheckboxBtn,
		bulkDeleteBtnDisabled = true

	let sunday = 7

	if ($weekOrder == 'monday') {
		sunday = 7
	}
	if ($weekOrder == 'sunday') {
		sunday = 0
		weekdays = [
			{value: 'sunday', name: $_('general.sunday')},
			{value: 'monday', name: $_('general.monday')},
			{value: 'tuesday', name: $_('general.tuesday')},
			{value: 'wednesday', name: $_('general.wednesday')},
			{value: 'thursday', name: $_('general.thursday')},
			{value: 'friday', name: $_('general.friday')},
			{value: 'saturday', name: $_('general.saturday')}
		]
	}

	sorter = {
		monday: 1,
		tuesday: 2,
		wednesday: 3,
		thursday: 4,
		friday: 5,
		saturday: 6,
		sunday: sunday
	}

	let schedules = liveQuery(() => db.schedule.toArray())
	$: filteredItems = $schedules
		?.filter(
			schedule =>
				$_('general.' + schedule.weekday)
					.toLocaleLowerCase()
					.normalize('NFD')
					.replace(/\p{Diacritic}/gu, '')
					.indexOf(
						searchTerm
							.toLowerCase()
							.normalize('NFD')
							.replace(/\p{Diacritic}/gu, '')
					) !== -1
		)
		.sort(function sortByDay(a, b) {
			let day1 = a.weekday
			let day2 = b.weekday
			return sorter[day1] - sorter[day2]
		})

	async function createSchedule() {
		if (location == '' || n_brothers < 1 || n_sisters < 1) {
			selected_weekday = $weekOrder
			start_time = '00:00'
			end_time = '00:00'
			location = ''
			n_brothers = 1
			n_sisters = 1

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('general.invalid-data')}
			})
			return
		}
		if (edit) {
			return editSchedule()
		}
		try {
			await db.schedule.add({
				weekday: selected_weekday,
				start_time: start_time,
				end_time: end_time,
				location: location,
				n_brothers: n_brothers,
				n_sisters: n_sisters
			})

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'success', alertMessage: $_('schedule.created')}
			})
		} catch (error) {
			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('schedule.failed') + error}
			})
		} finally {
			selected_weekday = $weekOrder
			start_time = '00:00'
			end_time = '00:00'
			location = ''
			n_brothers = 1
			n_sisters = 1
		}
	}

	async function deleteSchedule(alert = true) {
		await db.schedule.delete(selectedId)
		await db.availability.where({schedule_id: selectedId}).each(user_availability => {
			db.availability.delete(user_availability.id)
		})
		if (alert) {
			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'success', alertMessage: $_('schedule.deleted')}
			})
		}
	}

	function editSchedule() {
		db.schedule.update(selectedId, {
			weekday: selected_weekday,
			start_time: start_time,
			end_time: end_time,
			location: location,
			n_brothers: n_brothers,
			n_sisters: n_sisters
		})
		new AlertToast({
			target: document.querySelector('#toast-container'),
			props: {alertStatus: 'success', alertMessage: $_('schedule.modified')}
		})
		selected_weekday = $weekOrder
		start_time = '00:00'
		end_time = '00:00'
		location = ''
		n_brothers = 1
		n_sisters = 1
		edit = false
	}

	function toggleAllCheckbox(event: Event) {
		let checkboxName = 'schedule-checkbox'
		if ($mobile) {
			checkboxName = 'schedule-checkbox-mobile'
		}
		let checkboxes = document.getElementsByName(checkboxName)
		for (let i = 0; i < checkboxes.length; i++) {
			checkboxes[i].checked = event.target?.checked
		}
		if (event.target?.checked) {
			bulkDeleteBtnDisabled = false
		} else {
			bulkDeleteBtnDisabled = true
		}
	}

	async function bulkDelete() {
		let checkboxName = 'schedule-checkbox',
			ids = []
		if ($mobile) {
			checkboxName = 'schedule-checkbox-mobile'
		}
		let checkboxes = document.querySelectorAll(`input[name=${checkboxName}]:checked`)
		for (let i = 0; i < checkboxes.length; i++) {
			checkboxes[i].checked = false
			ids.push(parseInt(checkboxes[i].id.replace(checkboxName + '-', '')))
		}

		for (let el of ids) {
			selectedId = el
			await deleteSchedule(false)
		}

		new AlertToast({
			target: document.querySelector('#toast-container'),
			props: {alertStatus: 'success', alertMessage: $_('schedule.deleted')}
		})
		bulkDeleteBtnDisabled = true
	}
</script>

<svelte:head>
	<title>PPOC Gen - {$_('navbar.schedules')}</title>
</svelte:head>

<section class="mx-auto flex flex-col items-center justify-center px-6 py-8">
	<Card size="xl" class="mb-2">
		<div class="grid grid-cols-1 gap-3">
			{#if $mobile}
				<div class="mt-1">
					<Search size="md" bind:value={searchTerm} placeholder={$_('schedule.search-inp')} />
				</div>
			{/if}
			<Button
				color="blue"
				class="mb-4 mt-1"
				data-testid="schedules-create-btn"
				on:click={() => {
					createModal = true
					selected_weekday = $weekOrder
					start_time = '00:00'
					end_time = '00:00'
					location = ''
					n_brothers = 1
					n_sisters = 1
					modalTitle = $_('general.create-btn')
					edit = false
				}}>{$_('schedule.create-btn')}</Button
			>
			{#if $mobile}
				<div class="my-2 grid grid-cols-4 gap-4">
					{#if !$schedules || $schedules.length == 0}
						<CheckboxButton on:change={toggleAllCheckbox} color="alternative" disabled
							><CheckCircleSolid class="me-2 h-6 w-6" /></CheckboxButton
						>
					{:else}
						<CheckboxButton on:change={toggleAllCheckbox}><CheckCircleSolid class="me-2 h-6 w-6" /></CheckboxButton>
					{/if}
					<Button
						color="red"
						class="col-span-3"
						disabled={bulkDeleteBtnDisabled}
						on:click={() => {
							bulk = true
							deleteModal = true
						}}>{$_('general.bulk-delete')}</Button
					>
				</div>
			{:else}
				<Button
					color="red"
					class="mb-2"
					disabled={bulkDeleteBtnDisabled}
					on:click={() => {
						bulk = true
						deleteModal = true
					}}>{$_('general.bulk-delete')}</Button
				>
			{/if}
		</div>
	</Card>
	<Card size="xl" class="my-2">
		{#if $schedules}
			{#if $schedules.length == 0}
				<Card size="xl" class="mt-5">
					<h1 class="text-center dark:text-white">{$_('schedule.no-schedules')}</h1>
				</Card>
			{:else if $mobile}
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-4">
					{#each filteredItems as schedule}
						<Card padding="none" class="p-2" size="xl">
							<div class="flex justify-between">
								<Checkbox
									name="schedule-checkbox-mobile"
									id={`schedule-checkbox-mobile-${schedule.id}`}
									on:change={event => {
										if (event.target?.checked) {
											bulkDeleteBtnDisabled = false
										} else {
											if (document.querySelectorAll('input[name=schedule-checkbox-mobile]:checked').length == 0) {
												bulkDeleteBtnDisabled = true
											}
										}
									}}
								/>
								<Button class="!p-1" pill={true} outline={true}><ArrowRightOutline class="h-4 w-4" /></Button>
								<Dropdown class="p-1">
									<DropdownItem
										id="edit-{schedule.id}"
										on:click={() => {
											createModal = true
											selectedId = schedule.id
											edit = true
											selected_weekday = schedule.weekday
											n_brothers = schedule.n_brothers
											n_sisters = schedule.n_sisters
											location = schedule.location
											start_time = schedule.start_time
											end_time = schedule.end_time
											modalTitle = $_('general.edit-btn')
										}}
									>
										{$_('general.edit-btn')}
									</DropdownItem>
									<DropdownItem
										id="delete-{schedule.id}"
										on:click={() => {
											deleteModal = true
											bulk = false
											selectedId = schedule.id
										}}
										>{$_('general.delete-btn')}
									</DropdownItem>
								</Dropdown>
							</div>
							<div class="my-4 grid w-full grid-cols-2 gap-2 text-center text-gray-900 dark:text-white">
								<div>🗓️ {$_('general.' + schedule.weekday)}</div>
								<div>🕑 {schedule.start_time} - {schedule.end_time}</div>
							</div>
							<hr />
							<div class="my-4 grid grid-cols-2 gap-2 text-center text-gray-900 dark:text-white">
								<div>📍 {schedule.location}</div>
								<div class="grid grid-cols-2">
									<div>👔 {schedule.n_brothers}</div>
									<div>👗 {schedule.n_sisters}</div>
								</div>
							</div>
						</Card>
					{/each}
				</div>
			{:else}
				<TableSearch
					placeholder={$_('schedule.search-inp')}
					striped={true}
					hoverable={true}
					bind:inputValue={searchTerm}
				>
					<TableHead>
						<TableHeadCell class="!p-4">
							<Checkbox on:change={toggleAllCheckbox} bind:this={toggleAllCheckboxBtn} />
						</TableHeadCell>
						<TableHeadCell>{$_('schedule.weekday')}</TableHeadCell>
						<TableHeadCell>{$_('schedule.start-time')}</TableHeadCell>
						<TableHeadCell>{$_('schedule.end-time')}</TableHeadCell>
						<TableHeadCell>{$_('schedule.location')}</TableHeadCell>
						<TableHeadCell>{$_('schedule.n-bro')}</TableHeadCell>
						<TableHeadCell>{$_('schedule.n-sis')}</TableHeadCell>
						<TableHeadCell>
							<span class="sr-only">Actions</span>
						</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each filteredItems as schedule}
							<TableBodyRow>
								<TableBodyCell class="!p-4">
									<Checkbox
										name="schedule-checkbox"
										id={`schedule-checkbox-${schedule.id}`}
										on:change={event => {
											if (event.target?.checked) {
												bulkDeleteBtnDisabled = false
											} else {
												if (document.querySelectorAll('input[name=schedule-checkbox]:checked').length == 0) {
													bulkDeleteBtnDisabled = true
												}
											}
										}}
									/>
								</TableBodyCell>
								<TableBodyCell>{$_('general.' + schedule.weekday)}</TableBodyCell>
								<TableBodyCell>{schedule.start_time}</TableBodyCell>
								<TableBodyCell>{schedule.end_time}</TableBodyCell>
								<TableBodyCell>{schedule.location}</TableBodyCell>
								<TableBodyCell>{schedule.n_brothers}</TableBodyCell>
								<TableBodyCell>{schedule.n_sisters}</TableBodyCell>
								<TableBodyCell>
									<Button
										color="blue"
										class="mr-2"
										id="edit-{schedule.id}"
										on:click={() => {
											createModal = true
											selectedId = schedule.id
											edit = true
											selected_weekday = schedule.weekday
											n_brothers = schedule.n_brothers
											n_sisters = schedule.n_sisters
											location = schedule.location
											start_time = schedule.start_time
											end_time = schedule.end_time
											modalTitle = $_('general.edit-btn')
										}}>{$_('general.edit-btn')}</Button
									>
									<Button
										color="red"
										class="ml-2"
										id="delete-{schedule.id}"
										on:click={() => {
											deleteModal = true
											bulk = false
											selectedId = schedule.id
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
			{$_('schedule.weekday')}:
			<Select
				class="mt-2"
				id="weekday"
				items={weekdays}
				bind:value={selected_weekday}
				data-testid="schedules-create-weekday"
			/>
		</Label>
		<Label>
			{$_('schedule.start-time')}:
			<Input type="time" bind:value={start_time} data-testid="schedules-create-startTime" />
		</Label>
		<Label>
			{$_('schedule.end-time')}:
			<Input type="time" bind:value={end_time} data-testid="schedules-create-endTime" />
		</Label>
		<Label>
			{$_('schedule.location')}:
			<Input type="text" id="location" bind:value={location} required data-testid="schedules-create-location" />
		</Label>
		<div class="mb-6 grid gap-6 sm:grid-cols-2">
			<div>
				<Label for="n_brothers" class="mb-2">{$_('schedule.n-bro')}:</Label>
				<Input
					type="number"
					id="n_brothers"
					min="1"
					bind:value={n_brothers}
					required
					data-testid="schedules-create-nBrothers"
				/>
			</div>
			<div>
				<Label for="n_sisters" class="mb-2">{$_('schedule.n-sis')}:</Label>
				<Input
					type="number"
					id="n_sisters"
					min="1"
					bind:value={n_sisters}
					required
					data-testid="schedules-create-nSisters"
				/>
			</div>
		</div>
		<div class="text-center">
			<Button color="red" class="me-2" on:click={createSchedule} data-testid="schedules-create-submit">
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
				{$_('schedule.are-you-sure')}
			</h3>
			<Button
				color="red"
				class="me-2"
				on:click={() => {
					if (bulk) {
						bulkDelete()
					} else {
						deleteSchedule()
					}
				}}>{$_('general.yes-sure')}</Button
			>
			<Button color="alternative">{$_('general.no-cancel')}</Button>
		</div>
	</Modal>
</section>
