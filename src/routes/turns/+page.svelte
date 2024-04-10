<script lang="ts">
	import {
		Card,
		Button,
		Label,
		Input,
		Spinner,
		Badge,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHeadCell,
		TableSearch,
		TableHead,
		Modal,
		P
	} from 'flowbite-svelte'
	import {ExclamationCircleOutline, ArrowLeftOutline, ArrowRightOutline, FilePdfSolid} from 'flowbite-svelte-icons'
	import {
		toastMessageSuccess,
		toastSuccess,
		toastMessageAlert,
		toastAlert,
		toastMessageWarning,
		toastWarning
	} from '$lib/store'
	import {db} from '$lib/db'
	import {liveQuery} from 'dexie'
	import {_} from 'svelte-i18n'

	var date = new Date()
	let turns = liveQuery(() =>
		db.turn
			.where('date')
			.between(
				new Date(date.getFullYear(), date.getMonth(), 2).toISOString().split('T')[0],
				new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().split('T')[0]
			)
			.toArray()
	)
	let assignments = liveQuery(() => db.assignment.toArray())
	let showUsers = liveQuery(() => db.user.toArray())
	let schedules = liveQuery(() => db.schedule.toArray())
	let fromDate: string, toDate: string
	let loading: boolean = false
	let weekday: string,
		availabilities,
		users,
		incidences,
		userList: number[] = [],
		brothers: number = 0,
		sisters: number = 0,
		searchTerm: string = '',
		deleteModal: boolean = false,
		selectedId: number

	$: filteredItems = $turns?.filter(
		turn => turn.date.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
	)

	async function createTurns() {
		loading = true
		let from = new Date(fromDate)
		let to = new Date(toDate)

		if (from > to) {
			fromDate = ''
			toDate = ''
			loading = false

			$toastMessageAlert = $_('turns.from-bigger-to')
			$toastAlert = true
			setTimeout(() => {
				$toastAlert = false
			}, 8000)
			return
		}

		//Loop over weekdays
		weekdayLoop: for (var d = from; d <= to; d.setDate(d.getDate() + 1)) {
			weekday = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][d.getDay()]
			//Loop over schedules
			scheduleLoop: for (let schedule of $schedules) {
				if (schedule.weekday === weekday && schedule.id != undefined) {
					const exists = await db.turn.where({date: d.toISOString().split('T')[0], schedule_id: schedule.id}).first()
					if (exists) {
						continue
					}

					const turn_id: number = await db.turn.add({
						date: d.toISOString().split('T')[0],
						schedule_id: schedule.id
					})

					availabilities = await db.availability.where({schedule_id: schedule.id}).toArray()
					if (availabilities.length == 0) {
						$toastMessageWarning = $_('turns.no-availability') + weekday
						$toastWarning = true
						setTimeout(() => {
							$toastWarning = false
						}, 8000)
					}
					//Loop over availabilities
					availabilityLoop: for (let availability of availabilities) {
						userList.push(availability.user_id)
					}
					users = await db.user.where('id').anyOf(userList).sortBy('counter')
					if (users.length == 0) {
						$toastMessageWarning = $_('turns.no-publishers') + d.toISOString().split('T')[0]
						$toastWarning = true
						setTimeout(() => {
							$toastWarning = false
						}, 8000)
					}
					//Loop over users
					userLoop: for (let user of users) {
						incidences = await db.incidence.where({user_id: user.id}).toArray()
						//Loop over incidences
						incidenceLoop: for (let incidence of incidences) {
							if (
								incidence.start_date >= d.toISOString().split('T')[0] &&
								d.toISOString().split('T')[0] <= incidence.end_date
							) {
								continue userLoop
							}
						}
						if (user.gender === 'male' && brothers < parseInt(schedule.n_brothers) && user.id != undefined) {
							const counter = parseFloat(user.counter) + parseFloat(user.weight)
							db.assignment.add({
								user_id: user.id,
								turn_id: turn_id
							})
							db.user.update(user.id, {
								counter: counter
							})
							brothers++
						}
						if (user.gender === 'female' && sisters < parseInt(schedule.n_sisters) && user.id != undefined) {
							const counter = parseFloat(user.counter) + parseFloat(user.weight)
							db.assignment.add({
								user_id: user.id,
								turn_id: turn_id
							})
							db.user.update(user.id, {
								counter: parseFloat(counter)
							})
							sisters++
						}
					}
					userList = []
					brothers = 0
					sisters = 0
				}
			}
		}
		loading = false
	}

	async function deleteTurn() {
		await db.turn.delete(selectedId)
		const assignments = await db.assignment.where({turn_id: selectedId}).toArray()
		for (let assignment of assignments) {
			const users = await db.user.where({id: assignment.user_id}).toArray()
			for (let user of users) {
				const new_counter = parseFloat(user.counter) - parseFloat(user.weight)
				await db.user.update(user.id, {counter: parseFloat(new_counter)})
			}
			await db.assignment.delete(assignment.id)
		}

		$toastMessageSuccess = 'Turn deleted successfully'
		$toastSuccess = true
		setTimeout(() => {
			$toastSuccess = false
		}, 8000)
	}

	function exportToPDF() {}
</script>

<div class="mx-auto flex flex-col items-center justify-center px-6 py-8">
	<Card size="xl" class="mb-2">
		<div class="mb-4 mt-1 flex flex-row justify-around">
			<Label class="mr-2 w-3/12">
				{$_('turns.from')}:
				<Input type="date" bind:value={fromDate} />
			</Label>
			<Label class="ml-2 mr-2 w-3/12">
				{$_('turns.to')}:
				<Input type="date" bind:value={toDate} />
			</Label>
			<Button color="blue" class="ml-2 w-6/12" on:click={createTurns}>
				{#if loading}
					<Spinner class="me-3" size="4" color="white" />
					{$_('turns.creating')}
				{:else}
					{$_('turns.create-btn')}
				{/if}
			</Button>
		</div>
	</Card>
	{#if $turns && $schedules && $assignments && $showUsers}
		<Card size="xl" class="mt-2">
			<div class="mb-2 mt-2 flex flex-row justify-around">
				<Button
					class="w-2/12"
					on:click={() => {
						date = new Date(date.setMonth(date.getMonth() - 1))
						turns = liveQuery(() =>
							db.turn
								.where('date')
								.between(
									new Date(date.getFullYear(), date.getMonth(), 2).toISOString().split('T')[0],
									new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().split('T')[0]
								)
								.toArray()
						)
					}}><ArrowLeftOutline></ArrowLeftOutline></Button
				>
				<Button
					class="ml-2 mr-2 w-2/12"
					on:click={() => {
						date = new Date()
						turns = liveQuery(() =>
							db.turn
								.where('date')
								.between(
									new Date(date.getFullYear(), date.getMonth(), 2).toISOString().split('T')[0],
									new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().split('T')[0]
								)
								.toArray()
						)
					}}>Today</Button
				>
				<Badge border color="red" class="w-5/12"
					><P size="lg"
						>{$_('general.' + date.toLocaleString('en', {month: 'long'}).toLowerCase())} {date.getFullYear()}</P
					></Badge
				>
				<Button class="ml-2 mr-2 w-1/12" on:click={exportToPDF}><FilePdfSolid></FilePdfSolid></Button>
				<Button
					class="w-2/12"
					on:click={() => {
						date = new Date(date.setMonth(date.getMonth() + 1))
						turns = liveQuery(() =>
							db.turn
								.where('date')
								.between(
									new Date(date.getFullYear(), date.getMonth(), 2).toISOString().split('T')[0],
									new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().split('T')[0]
								)
								.toArray()
						)
					}}><ArrowRightOutline></ArrowRightOutline></Button
				>
			</div>
			{#if $turns.length == 0 || $schedules.length == 0}
				<p class="mt-8 text-center">{$_('turns.no-turns')}</p>
			{:else}
				<TableSearch placeholder={$_('turns.search-by')} striped={true} hoverable={true} bind:inputValue={searchTerm}>
					<TableHead>
						<TableHeadCell>{$_('turns.day')}</TableHeadCell>
						<TableHeadCell>{$_('turns.time')}</TableHeadCell>
						<TableHeadCell>{$_('schedule.location')}</TableHeadCell>
						<TableHeadCell>{$_('turns.assignees')}</TableHeadCell>
						<TableHeadCell>
							<span class="sr-only">Actions</span>
						</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each filteredItems as turn}
							{#each $schedules as schedule}
								{#if schedule.id === turn.schedule_id}
									<TableBodyRow>
										<TableBodyCell>{turn.date}</TableBodyCell>
										<TableBodyCell>{schedule.start_time + ' - ' + schedule.end_time}</TableBodyCell>
										<TableBodyCell>{schedule.location}</TableBodyCell>
										<TableBodyCell>
											{#each $assignments as assignment}
												{#if assignment.turn_id == turn.id}
													{#if assignment.user_id === -1}
														<Badge color="yellow" class="m-1">{$_('turns.deleted-pub')}</Badge>
													{/if}
													{#each $showUsers as user}
														{#if user.id == assignment.user_id}
															{#if user.gender == 'male'}
																<Badge color="blue" class="m-1">{user.firstname + ' ' + user.lastname}</Badge>
															{:else}
																<Badge color="pink" class="m-1">{user.firstname + ' ' + user.lastname}</Badge>
															{/if}
														{/if}
													{/each}
												{/if}
											{/each}
										</TableBodyCell>
										<TableBodyCell>
											<Button color="blue" class="mr-2" id="edit-{turn.id}">{$_('general.edit-btn')}</Button>
											<Button
												color="red"
												class="ml-2"
												id="delete-{turn.id}"
												on:click={() => {
													deleteModal = true
													selectedId = turn.id
												}}>{$_('general.delete-btn')}</Button
											>
										</TableBodyCell>
									</TableBodyRow>
								{/if}
							{/each}
						{/each}
					</TableBody>
				</TableSearch>
			{/if}
		</Card>

		<Modal bind:open={deleteModal} size="xs" autoclose outsideclose>
			<div class="text-center">
				<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />
				<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
					{$_('turns.are-you-sure')}
				</h3>
				<Button color="red" class="me-2" on:click={deleteTurn}>{$_('general.yes-sure')}</Button>
				<Button color="alternative">{$_('general.no-cancel')}</Button>
			</div>
		</Modal>
	{/if}
</div>
