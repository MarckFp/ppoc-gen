<script lang="ts">
	import {
		Card,
		Button,
		Label,
		Input,
		MultiSelect,
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
	import AlertToast from '$lib/components/AlertToast.svelte'
	import {db} from '$lib/db'
	import {liveQuery} from 'dexie'
	import {_} from 'svelte-i18n'
	import type {User} from '$lib/models/user'
	import type {Incidence} from '$lib/models/incidence'
	import type {Availability} from '$lib/models/availability'
	import type {Affinity} from '$lib/models/affinity'

	var date: Date = new Date()
	let fromDate: string,
		toDate: string,
		weekday: string,
		loading: boolean = false,
		deleteModal: boolean = false,
		createModal: boolean = false,
		creationDisabled: boolean = false,
		edit: boolean = false,
		availabilities: Availability[],
		users: User[],
		incidences: Incidence[],
		affinities: Affinity[],
		userList: number[] = [],
		brothers: number = 0,
		sisters: number = 0,
		searchTerm: string = '',
		selectedId: number,
		turnDate: string,
		turnStartTime: string,
		turnEndTime: string,
		turnLocation: string,
		turnAssignees: number[],
		turnAssigneesList: {value: number; name: string; color: string}[] = []

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

	db.user.orderBy('firstname').each(user => {
		if (user.id != undefined) {
			if (user.gender == 'male') {
				turnAssigneesList.push({value: user.id, name: user.firstname + ' ' + user.lastname, color: 'blue'})
			} else {
				turnAssigneesList.push({value: user.id, name: user.firstname + ' ' + user.lastname, color: 'pink'})
			}
		}
	})

	//TODO: Fix filters not working correctly (Apparently is using full date but we display weekday and day)
	$: filteredItems = $turns?.filter(turn => turn.date.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)

	//TODO: Currently affinities are quite basic, we need to improve it.
	// also, if a schedule has only 1 male publisher if 2 male people have affinity they are never going to be together

	//TODO: Add feature to fill turns generated without publishers, this will require us to continue if a turn exists but don't add it and fill the array
	// of brothers and sisters with publishers already attached to it so we don't assign twice
	async function generateTurns() {
		loading = true
		creationDisabled = true
		if (fromDate == undefined || toDate == undefined) {
			fromDate = ''
			toDate = ''
			loading = false
			creationDisabled = false

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('turns.date-invalid')}
			})
			return
		}
		let from: Date = new Date(fromDate),
			to: Date = new Date(toDate)

		if (from > to) {
			fromDate = ''
			toDate = ''
			loading = false
			creationDisabled = false

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('turns.from-bigger-to')}
			})
			return
		}

		//Loop over weekdays
		weekdayLoop: for (var d = from; d <= to; d.setDate(d.getDate() + 1)) {
			weekday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][d.getDay()]
			//Loop over schedules
			scheduleLoop: for (let schedule of $schedules) {
				if (schedule.weekday === weekday && schedule.id != undefined) {
					const exists = await db.turn
						.where({
							date: d.toISOString().split('T')[0],
							start_time: schedule.start_time,
							end_time: schedule.end_time,
							location: schedule.location
						})
						.first()
					if (exists) {
						continue
					}

					const turn_id: number = await db.turn.add({
						date: d.toISOString().split('T')[0],
						start_time: schedule.start_time,
						end_time: schedule.end_time,
						location: schedule.location
					})

					availabilities = await db.availability.where({schedule_id: schedule.id}).toArray()
					if (availabilities.length == 0) {
						new AlertToast({
							target: document.querySelector('#toast-container'),
							props: {
								alertStatus: 'warning',
								fadeDelay: 15000,
								alertMessage: $_('turns.no-availability') + $_('general.' + weekday)
							}
						})
					}
					//Loop over availabilities
					availabilityLoop: for (let availability of availabilities) {
						userList.push(availability.user_id)
					}
					users = await db.user.where('id').anyOf(userList).sortBy('counter')
					if (users.length == 0) {
						new AlertToast({
							target: document.querySelector('#toast-container'),
							props: {
								alertStatus: 'warning',
								fadeDelay: 15000,
								alertMessage: $_('turns.no-publishers') + d.toISOString().split('T')[0]
							}
						})
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
						//Check if publisher already exists on the turn
						const userAssignment = await db.assignment.where({user_id: user.id, turn_id: turn_id}).first()
						if (userAssignment != undefined) {
							continue userLoop
						}

						//Add Brother to the turn
						if (user.gender === 'male' && brothers < schedule.n_brothers && user.id != undefined) {
							const counter = user.counter + user.weight
							db.assignment.add({
								user_id: user.id,
								turn_id: turn_id
							})
							db.user.update(user.id, {
								counter: counter
							})
							brothers++
						}
						//Add Sister to the turn
						if (user.gender === 'female' && sisters < schedule.n_sisters && user.id != undefined) {
							const counter = user.counter + user.weight
							db.assignment.add({
								user_id: user.id,
								turn_id: turn_id
							})
							db.user.update(user.id, {
								counter: counter
							})
							sisters++
						}

						affinities = await db.affinity.where({source_id: user.id}).toArray()
						//Loop over affinities
						affinityLoop: for (let affinity of affinities) {
							const affinityUser = await db.user.where({id: affinity.destination_id}).first()
							if (Math.round(user.counter) == Math.round(affinityUser?.counter)) {
								if (
									affinityUser?.gender === 'male' &&
									brothers < schedule.n_brothers &&
									affinityUser?.id != undefined
								) {
									const counter = user.counter + user.weight
									db.assignment.add({
										user_id: affinityUser?.id,
										turn_id: turn_id
									})
									db.user.update(affinityUser?.id, {
										counter: counter
									})
									brothers++
								}
								if (
									affinityUser?.gender === 'female' &&
									sisters < schedule.n_sisters &&
									affinityUser?.id != undefined
								) {
									const counter = user.counter + user.weight
									db.assignment.add({
										user_id: affinityUser?.id,
										turn_id: turn_id
									})
									db.user.update(affinityUser?.id, {
										counter: counter
									})
									sisters++
								}
							}
						}
					}
					userList = []
					brothers = 0
					sisters = 0
				}
			}
		}
		new AlertToast({
			target: document.querySelector('#toast-container'),
			props: {alertStatus: 'success', alertMessage: $_('turns.created')}
		})
		loading = false
		creationDisabled = false
	}

	async function deleteTurn() {
		await db.turn.delete(selectedId)
		const assignments = await db.assignment.where({turn_id: selectedId}).toArray()
		for (let assignment of assignments) {
			const users = await db.user.where({id: assignment.user_id}).toArray()
			for (let user of users) {
				const new_counter = user.counter - user.weight
				await db.user.update(user.id, {counter: new_counter})
			}
			await db.assignment.delete(assignment.id)
		}

		new AlertToast({
			target: document.querySelector('#toast-container'),
			props: {alertStatus: 'success', alertMessage: $_('turns.deleted')}
		})
	}

	async function createTurns() {
		if (turnDate == undefined || turnDate == '') {
			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('turns.date-invalid')}
			})
			return
		}
		if (edit) {
			return editTurns()
		}

		try {
			const id = await db.turn.add({
				date: turnDate,
				start_time: turnStartTime,
				end_time: turnEndTime,
				location: turnLocation
			})

			turnAssignees.forEach(async assignee => {
				db.assignment.add({
					user_id: assignee,
					turn_id: id
				})

				const user = await db.user.where({id: assignee}).first()
				db.user.update(assignee, {
					counter: user?.counter + user?.weight
				})
			})

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'success', alertMessage: $_('turns.created')}
			})
		} catch (error) {
			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('turns.failed') + error}
			})
		} finally {
			turnAssignees = []
			turnLocation = ''
			turnDate = ''
			turnStartTime = ''
			turnEndTime = ''
		}
	}

	async function editTurns() {
		try {
			db.turn.update(selectedId, {
				date: turnDate,
				start_time: turnStartTime,
				end_time: turnEndTime,
				location: turnLocation
			})

			const assignments = await db.assignment.where({turn_id: selectedId}).toArray()
			for (let assignment of assignments) {
				const users = await db.user.where({id: assignment.user_id}).toArray()
				for (let user of users) {
					await db.user.update(user.id, {
						counter: user?.counter - user?.weight
					})
				}
			}
			await db.assignment.where({turn_id: selectedId}).delete()

			turnAssignees.forEach(async assignee => {
				db.assignment.add({
					user_id: assignee,
					turn_id: selectedId
				})

				const user = await db.user.where({id: assignee}).first()
				db.user.update(assignee, {
					counter: user?.counter + user?.weight
				})
			})

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'success', alertMessage: $_('turns.modified')}
			})
		} catch (error) {
			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('turns.mod-error') + error}
			})
		} finally {
			turnAssignees = []
			turnLocation = ''
			turnDate = ''
			turnStartTime = ''
			turnEndTime = ''
			edit = false
		}
	}

	//TODO: Create basic export to PDF until the calendar is ready
	async function exportToPDF() {
		window.print()
	}

	//TODO: Fix this, currently we query all assignments and then look for which turn is using what assignment but this have poor performance
	async function getAssignees(turn_id: number) {
		turnAssignees = []
		for (let assignment of $assignments) {
			if (assignment.turn_id == turn_id) {
				turnAssignees.push(assignment.user_id)
			}
		}
	}

	//TODO: Delete turns of more than 5 years when we generate or create manually new ones
	async function deleteYearlyTurns() {
		const turns = await db.turn.toArray()
		const tmpDate = new Date()
		tmpDate.setFullYear(tmpDate.getFullYear() - 5)
		for (let turn of turns) {
			const tmpturnDate = new Date(turn.date)
			if (tmpturnDate <= tmpDate) {
				db.assignment.where({turn_id: turn.id}).delete()
				db.turn.delete(turn.id)
			}
		}
	}
</script>

<div class="mx-auto flex flex-col items-center justify-center px-6 py-8">
	<Card size="xl" class="mb-2 print:hidden">
		<div class="mb-4 mt-1 flex flex-row justify-between">
			<Label class="w-2/12">
				{$_('turns.from')}:
				<Input type="date" bind:value={fromDate} />
			</Label>
			<Label class="mr-1 ml-1 w-2/12">
				{$_('turns.to')}:
				<Input type="date" bind:value={toDate} />
			</Label>
			<Button color="green" class="mr-1 ml-1 w-4/12" on:click={generateTurns} disabled={creationDisabled}>
				{#if loading}
					<Spinner class="me-3" size="4" color="white" />
					{$_('turns.creating')}
				{:else}
					{$_('turns.generate-btn')}
				{/if}
			</Button>
			<Button
				color="blue"
				class="w-4/12"
				on:click={() => {
					createModal = true
					edit = false
					turnAssignees = []
					turnLocation = ''
					turnDate = ''
					turnStartTime = ''
					turnEndTime = ''
				}}
			>
				{$_('turns.create-btn')}
			</Button>
		</div>
	</Card>
	{#if $turns && $schedules && $assignments && $showUsers}
		<Card size="xl" class="mt-2">
			<div class="mb-2 mt-2 flex flex-row justify-around print:hidden">
				<Button
					class="w-2/12"
					aria-label="Previous Month"
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
					color="blue"
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
					}}>{$_('turns.today')}</Button
				>
				<Badge border color="red" class="w-5/12"
					><P size="lg"
						>{$_('general.' + date.toLocaleString('en', {month: 'long'}).toLowerCase())} {date.getFullYear()}</P
					></Badge
				>
				<Button class="ml-2 mr-2 w-1/12" on:click={exportToPDF} aria-label="Export to PDF"
					><FilePdfSolid></FilePdfSolid></Button
				>
				<Button
					class="w-2/12"
					aria-label="Next Month"
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
				<TableSearch placeholder={$_('turns.search-by')} striped={true} hoverable={true} bind:inputValue={searchTerm} innerDivClass="p-4 print:hidden">
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
							<TableBodyRow>
								<TableBodyCell
									>{$_(
										'general.' +
											['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
												new Date(turn.date).getDay()
											]
									) +
										' ' +
										new Date(turn.date).getDate()}</TableBodyCell
								>
								<TableBodyCell>{turn.start_time + ' - ' + turn.end_time}</TableBodyCell>
								<TableBodyCell>{turn.location}</TableBodyCell>
								<TableBodyCell tdClass="flex px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
									{#each $assignments as assignment}
										{#if assignment.turn_id == turn.id}
											{#if assignment.user_id === -1}
												<Badge color="yellow" class="m-1">{$_('turns.deleted-pub')}</Badge>
											{/if}
											{#each $showUsers as user}
												{#if user.id == assignment.user_id}
													{#if user.gender == 'male'}
														<Badge color="blue" class="m-1 order-1">{user.firstname + ' ' + user.lastname}</Badge>
													{:else}
														<Badge color="pink" class="m-1 order-2">{user.firstname + ' ' + user.lastname}</Badge>
													{/if}
												{/if}
											{/each}
										{/if}
									{/each}
								</TableBodyCell>
								<TableBodyCell>
									<Button
										color="blue"
										class="mr-2 print:hidden"
										id="edit-{turn.id}"
										on:click={async () => {
											createModal = true
											edit = true
											turnLocation = turn.location
											turnDate = turn.date
											turnStartTime = turn.start_time
											turnEndTime = turn.end_time
											selectedId = turn.id
											await getAssignees(turn.id)
										}}>{$_('general.edit-btn')}</Button
									>
									<Button
										color="red"
										class="ml-2 print:hidden"
										id="delete-{turn.id}"
										on:click={() => {
											deleteModal = true
											selectedId = turn.id
										}}>{$_('general.delete-btn')}</Button
									>
								</TableBodyCell>
							</TableBodyRow>
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

		<Modal bind:open={createModal} size="xs" autoclose outsideclose>
			<Label>
				{$_('turns.day')}:
				<Input type="date" bind:value={turnDate} required />
			</Label>
			<Label>
				{$_('schedule.start-time')}:
				<Input type="time" bind:value={turnStartTime} required />
			</Label>
			<Label>
				{$_('schedule.end-time')}:
				<Input type="time" bind:value={turnEndTime} required />
			</Label>
			<Label>
				{$_('schedule.location')}:
				<Input type="text" id="location" bind:value={turnLocation} required />
			</Label>
			<Label>
				{$_('turns.assignees')}:
				{turnAssignees.length}
				<MultiSelect items={turnAssigneesList} bind:value={turnAssignees} size="sm" let:item let:clear>
					<Badge color={item.color} dismissable params={{duration: 100}} on:close={clear}>
						{item.name}
					</Badge>
				</MultiSelect>
			</Label>
			<div class="text-center">
				<Button color="red" class="me-2" on:click={createTurns}>
					{#if edit}
						{$_('general.edit-btn')}
					{:else}
						{$_('general.create-btn')}
					{/if}
				</Button>
				<Button color="alternative">{$_('general.cancel-btn')}</Button>
			</div>
		</Modal>
	{/if}
</div>
