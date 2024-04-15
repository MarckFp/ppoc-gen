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
		TableHead
	} from 'flowbite-svelte'
	import {ExclamationCircleOutline} from 'flowbite-svelte-icons'
	import Timepicker from '$lib/components/Timepicker.svelte'
	import {db} from '$lib/db'
	import {toastMessageSuccess, toastSuccess, toastMessageAlert, toastAlert} from '$lib/store'
	import {liveQuery} from 'dexie'
	import {_} from 'svelte-i18n'

	let createModal: boolean = false,
		deleteModal: boolean = false,
		edit: boolean = false,
		searchTerm: string = '',
		selected_weekday: string = 'monday',
		start_time: string = '00:00',
		end_time: string = '00:00',
		location: string = '',
		n_brothers: number = 1,
		n_sisters: number = 1,
		selectedId: number,
		weekdays: {value: string; name: string}[] = [
			{value: 'monday', name: $_('general.monday')},
			{value: 'tuesday', name: $_('general.tuesday')},
			{value: 'wednesday', name: $_('general.wednesday')},
			{value: 'thursday', name: $_('general.thursday')},
			{value: 'friday', name: $_('general.friday')},
			{value: 'saturday', name: $_('general.saturday')},
			{value: 'sunday', name: $_('general.sunday')}
		]

	let schedules = liveQuery(() => db.schedule.toArray())
	$: filteredItems = $schedules?.filter(
		schedule => schedule.weekday.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
	)

	async function createSchedule() {
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

			$toastMessageSuccess = $_('schedule.created')
			$toastSuccess = true
			setTimeout(() => {
				$toastSuccess = false
			}, 8000)
		} catch (error) {
			$toastMessageAlert = $_('schedule.failed') + error
			$toastAlert = true
			setTimeout(() => {
				$toastAlert = false
			}, 8000)
		} finally {
			selected_weekday = 'monday'
			start_time = '00:00'
			end_time = '00:00'
			location = ''
			n_brothers = 1
			n_sisters = 1
		}
	}

	async function deleteSchedule() {
		await db.schedule.delete(selectedId)
		await db.availability.where({schedule_id: selectedId}).each(user_availability => {
			db.availability.delete(user_availability.id)
		})
		$toastMessageSuccess = $_('schedule.deleted')
		$toastSuccess = true
		setTimeout(() => {
			$toastSuccess = false
		}, 8000)
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
		$toastMessageSuccess = $_('schedule.modified')
		$toastSuccess = true
		setTimeout(() => {
			$toastSuccess = false
		}, 8000)
		selected_weekday = 'monday'
		start_time = '00:00'
		end_time = '00:00'
		location = ''
		n_brothers = 1
		n_sisters = 1
		edit = false
	}
</script>

<div class="mx-auto flex flex-col items-center justify-center px-6 py-8">
	<Card size="xl">
		<Button
			color="blue"
			class="mb-4 mt-1"
			on:click={() => {
				createModal = true
				selected_weekday = 'monday'
				start_time = '00:00'
				end_time = '00:00'
				location = ''
				n_brothers = 1
				n_sisters = 1
				edit = false
			}}>{$_('schedule.create-btn')}</Button
		>
		{#if $schedules}
			{#if $schedules.length == 0}
				<Card size="xl" class="mt-5">
					<h1 class="text-center">{$_('schedule.no-schedules')}</h1>
				</Card>
			{:else}
				<TableSearch
					placeholder={$_('schedule.search-inp')}
					striped={true}
					hoverable={true}
					bind:inputValue={searchTerm}
				>
					<TableHead>
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
										}}>{$_('general.edit-btn')}</Button
									>
									<Button
										color="red"
										class="ml-2"
										id="delete-{schedule.id}"
										on:click={() => {
											deleteModal = true
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

	<Modal bind:open={createModal} size="xs" autoclose outsideclose>
		<Label>
			{$_('schedule.weekday')}:
			<Select class="mt-2" id="weekday" items={weekdays} bind:value={selected_weekday} />
		</Label>
		<Label>
			{$_('schedule.start-time')}:
			<Timepicker bind:selectedTime={start_time} />
		</Label>
		<Label>
			{$_('schedule.end-time')}:
			<Timepicker bind:selectedTime={end_time} />
		</Label>
		<Label>
			{$_('schedule.location')}:
			<Input type="text" id="location" bind:value={location} required />
		</Label>
		<div class="mb-6 grid gap-6 md:grid-cols-2">
			<div>
				<Label for="n_brothers" class="mb-2">{$_('schedule.n-bro')}:</Label>
				<Input type="number" id="n_brothers" bind:value={n_brothers} required />
			</div>
			<div>
				<Label for="n_sisters" class="mb-2">{$_('schedule.n-sis')}:</Label>
				<Input type="number" id="n_sisters" bind:value={n_sisters} required />
			</div>
		</div>
		<div class="text-center">
			<Button color="red" class="me-2" on:click={createSchedule}>
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
			<Button color="red" class="me-2" on:click={deleteSchedule}>{$_('general.yes-sure')}</Button>
			<Button color="alternative">{$_('general.no-cancel')}</Button>
		</div>
	</Modal>
</div>
