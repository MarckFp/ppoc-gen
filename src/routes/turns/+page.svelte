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
		deleteModal = false,
		selectedId: number

	async function createTurns() {
		loading = true
		let from = new Date(fromDate)
		let to = new Date(toDate)

		if (from > to) {
			fromDate = ''
			toDate = ''
			loading = false

			$toastMessageAlert = `From Date cannot be bigger than To Date`
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
						$toastMessageWarning = `There is no publishers with availability on ${weekday}`
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
						$toastMessageWarning = `There is no publishers that can be assigned on ${d.toISOString().split('T')[0]}`
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

		fromDate = ''
		toDate = ''
		loading = false
	}

	async function deleteTurn() {
		await db.turn.delete(selectedId)
		const assignments = await db.assignment.where({turn_id: selectedId}).toArray()
		assignments.forEach(async assignment => {
			await db.assignment.delete(assignment.id)
		})

		$toastMessageSuccess = $_('publishers.pub-deleted')
		$toastSuccess = true
		setTimeout(() => {
			$toastSuccess = false
		}, 8000)
	}

	function exportToPDF() {
		
	}
</script>

<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto">
	<Card size="xl" class="mb-2">
		<div class="mt-1 mb-4 flex flex-row justify-around">
			<Label class="w-3/12 mr-2">
				{$_('turns.from')}:
				<Input type="date" bind:value={fromDate} />
			</Label>
			<Label class="w-3/12 mr-2 ml-2">
				{$_('turns.to')}:
				<Input type="date" bind:value={toDate} />
			</Label>
			<Button color="blue" class="w-6/12 ml-2" on:click={createTurns}>
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
			<div class="flex flex-row justify-around mb-2 mt-2">
				<Button
					class="w-2/12 ml-2 mr-2"
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
					class="w-2/12 ml-2 mr-2"
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
				<Badge rounded border color="red" class="w-5/12 ml-2 mr-2"
					><P size="lg"
						>{$_('general.' + date.toLocaleString('default', {month: 'long'}).toLowerCase())} {date.getFullYear()}</P
					></Badge
				>
				<Button class="w-1/12 ml-2 mr-2"><FilePdfSolid></FilePdfSolid></Button>
				<Button
					class="w-2/12 ml-2 mr-2"
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
				<p class="text-center mt-8">{$_('turns.no-turns')}</p>
			{:else}
				<TableSearch placeholder="busqueda" striped={true} hoverable={true}>
					<TableHead>
						<TableHeadCell>Day</TableHeadCell>
						<TableHeadCell>Time</TableHeadCell>
						<TableHeadCell>{$_('schedule.location')}</TableHeadCell>
						<TableHeadCell>Assignees</TableHeadCell>
						<TableHeadCell>
							<span class="sr-only">Actions</span>
						</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each $turns as turn}
							{#each $schedules as schedule}
								{#if schedule.id === turn.schedule_id}
									<TableBodyRow>
										<TableBodyCell>{turn.date}</TableBodyCell>
										<TableBodyCell>{schedule.start_time + ' - ' + schedule.end_time}</TableBodyCell>
										<TableBodyCell>{schedule.location}</TableBodyCell>
										<TableBodyCell>
											{#each $assignments as assignment}
												{#if assignment.turn_id == turn.id}
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
				<ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
				<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
					{$_('publishers.are-you-sure')}
				</h3>
				<Button color="red" class="me-2" on:click={deleteTurn}>{$_('general.yes-sure')}</Button>
				<Button color="alternative">{$_('general.no-cancel')}</Button>
			</div>
		</Modal>
	{/if}
</div>
