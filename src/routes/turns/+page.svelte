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
		TableHead
	} from 'flowbite-svelte'
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
	let turnList: number[] = []
	var firstDay = new Date(date.getFullYear(), date.getMonth(), 2).toISOString().split('T')[0]
	var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().split('T')[0]
	let turns = liveQuery(() => db.turn.where('date').between(firstDay, lastDay).toArray())

	$: {
		$turns?.forEach(turn => {
			turnList.push(turn.id)
		})
	}
	let assignments = liveQuery(() => db.assignment.where('turn_id').anyOf(turnList).toArray())
	let showUsers = liveQuery(() => db.user.toArray())

	let schedules = liveQuery(() => db.schedule.toArray())

	let fromDate: string, toDate: string
	let loading: boolean = false
	let weekday: string,
		availabilities,
		users,
		incidences,
		userList: number[] = [],
		skip: boolean = false,
		brothers: number = 0,
		sisters: number = 0

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
		for (var d = from; d <= to; d.setDate(d.getDate() + 1)) {
			weekday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][d.getDay()]
			//Loop over schedules
			$schedules.forEach(async schedule => {
				if (schedule.weekday === weekday) {
					const turn_id = await db.turn.add({
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
					availabilities.forEach(async availability => {
						userList.push(availability.user_id)
					})
					users = await db.user.where('id').anyOf(userList).reverse().sortBy('counter')
					if (users.length == 0) {
						$toastMessageWarning = `There is no publishers that can be assigned on ${d.toISOString().split('T')[0]}`
						$toastWarning = true
						setTimeout(() => {
							$toastWarning = false
						}, 8000)
					}
					//Loop over users
					users.forEach(async user => {
						incidences = await db.incidence.where({user_id: user.id}).toArray()
						//Loop over incidences
						incidences.forEach(async incidence => {
							if (
								incidence.start_date >= d.toISOString().split('T')[0] &&
								d.toISOString().split('T')[0] <= incidence.end_date
							) {
								skip = true
							}
						})
						//If user doesn't have incidences
						if (skip === false) {
							if (user.gender === 'male' && brothers < parseInt(schedule.n_brothers)) {
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
							if (user.gender === 'female' && sisters < parseInt(schedule.n_sisters)) {
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
						skip = false
					})
					userList = []
					brothers = 0
					sisters = 0
				}
			})
		}

		fromDate = ''
		toDate = ''
		loading = false
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
			{#if $turns.length == 0 || $schedules.length == 0}
				<p class="text-center">{$_('turns.no-turns')}</p>
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
											<Button color="red" class="ml-2" id="delete-{turn.id}">{$_('general.delete-btn')}</Button>
										</TableBodyCell>
									</TableBodyRow>
								{/if}
							{/each}
						{/each}
					</TableBody>
				</TableSearch>
			{/if}
		</Card>
	{/if}
</div>
