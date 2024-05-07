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
	import {onMount} from 'svelte'

	var date: Date = new Date()
	let fromDate: string,
		toDate: string,
		loading: boolean = false,
		deleteModal: boolean = false,
		createModal: boolean = false,
		creationDisabled: boolean = false,
		edit: boolean = false,
		userList: number[] = [],
		searchTerm: string = '',
		name_order = 'firstname',
		query_name_order = 'firstname+lastname',
		selectedId: number,
		turnDate: string,
		turnStartTime: string,
		turnEndTime: string,
		turnLocation: string,
		turnAssignees: number[],
		turnAssigneesList: {value: number; name: string; color: string}[] = []

	onMount(async () => {
		let cong = await db.congregation.orderBy('id').first()

		if (cong) {
			if (cong.name_order) {
				if (cong.name_order == 'firstname') {
					name_order = 'firstname'
					query_name_order = 'firstname+lastname'
				}
				if (cong.name_order == 'lastname') {
					name_order = 'lastname'
					query_name_order = 'lastname+firstname'
				}
			}
		}
		await deleteYearlyTurns()
	})

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

	db.user.orderBy(`[${query_name_order}]`).each(user => {
		if (user.id != undefined) {
			if (name_order == 'firstname') {
				if (user.gender == 'male') {
					turnAssigneesList.push({value: user.id, name: user.firstname + ' ' + user.lastname, color: 'blue'})
				} else {
					turnAssigneesList.push({value: user.id, name: user.firstname + ' ' + user.lastname, color: 'pink'})
				}
			}
			if (name_order == 'lastname') {
				if (user.gender == 'male') {
					turnAssigneesList.push({value: user.id, name: user.lastname + ' ' + user.firstname, color: 'blue'})
				} else {
					turnAssigneesList.push({value: user.id, name: user.lastname + ' ' + user.firstname, color: 'pink'})
				}
			}
		}
	})

	$: filteredItems = $turns?.filter(
		turn =>
			(
				$_(
					'general.' +
						['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(turn.date).getDay()]
				) +
				' ' +
				new Date(turn.date).getDate()
			)
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

	async function generateTurns() {
		let brothers: number = 0,
			sisters: number = 0
		loading = true
		creationDisabled = true
		if (fromDate == undefined || toDate == undefined || fromDate == '' || toDate == '') {
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
			let weekday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][d.getDay()]

			//Check if the congregation has an incidence
			const congIncidences = await db.incidence.where({user_id: -1}).toArray()
			for (let incidence of congIncidences) {
				if (
					incidence.start_date <= d.toISOString().split('T')[0] &&
					incidence.end_date >= d.toISOString().split('T')[0]
				) {
					new AlertToast({
						target: document.querySelector('#toast-container'),
						props: {
							alertStatus: 'warning',
							fadeDelay: 15000,
							alertMessage: `${$_('general.' + weekday)} ${d.getDate()} ${$_('turns.cong-inc')}`
						}
					})
					continue weekdayLoop
				}
			}
			//Loop over schedules
			for (let schedule of $schedules) {
				if (schedule.weekday === weekday && schedule.id != undefined) {
					//Check if Turn already exists
					if (
						await db.turn
							.where({
								date: d.toISOString().split('T')[0],
								start_time: schedule.start_time,
								end_time: schedule.end_time,
								location: schedule.location
							})
							.first()
					) {
						continue
					}

					let turn_id: number = await db.turn.add({
						date: d.toISOString().split('T')[0],
						start_time: schedule.start_time,
						end_time: schedule.end_time,
						location: schedule.location
					})

					let availabilities = await db.availability.where({schedule_id: schedule.id}).toArray()
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
					userList = availabilities.map(availability => availability.user_id)
					let users = await db.user.where('id').anyOf(userList).sortBy('counter')
					if (users.length == 0) {
						new AlertToast({
							target: document.querySelector('#toast-container'),
							props: {
								alertStatus: 'warning',
								fadeDelay: 15000,
								alertMessage:
									$_('turns.no-publishers') +
									$_(
										'general.' +
											['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][d.getDay()]
									) +
									' ' +
									d.getDate() +
									' ' +
									schedule.start_time +
									' - ' +
									schedule.end_time
							}
						})
					}
					//Loop over users with Affinities
					userLoop: for (let user of users) {
						if (user && user.id) {
							if (
								(await checkPublisherTurn(user.id, d)) ||
								(brothers >= schedule.n_brothers && user.gender == 'male') ||
								(sisters >= schedule.n_sisters && user.gender == 'female')
							) {
								continue userLoop
							}

							let affinities = await db.affinity.where({source_id: user.id}).toArray()
							if (affinities.length > 0) {
								await db.assignment.add({
									user_id: user.id,
									turn_id: turn_id
								})
								await db.user.update(user.id, {
									counter: user.counter + user.weight
								})
								if (user.gender === 'male') {
									brothers++
								} else if (user.gender === 'female') {
									sisters++
								}
								//Loop over affinities
								affinitiesLoop: for (let affinity of affinities) {
									let affinityUser = await db.user.where({id: affinity.destination_id}).first()
									if (affinityUser && affinityUser.id) {
										if (await checkPublisherTurn(affinityUser.id, d)) {
											continue affinitiesLoop
										}
										await db.assignment.add({
											user_id: affinityUser.id,
											turn_id: turn_id
										})
										await db.user.update(affinityUser.id, {
											counter: affinityUser.counter + affinityUser.weight
										})
										if (affinityUser.gender === 'male') {
											brothers++
										} else if (affinityUser.gender === 'female') {
											sisters++
										}
									}
								}
							}
							if (schedule.n_brothers - brothers < 1 || schedule.n_sisters - sisters < 1) {
								break userLoop
							}
						}
					}
					//Loop over users without Affinities
					userLoop: for (let user of users) {
						if (user && user.id) {
							if (
								(await checkPublisherTurn(user.id, d)) ||
								(brothers >= schedule.n_brothers && user.gender == 'male') ||
								(sisters >= schedule.n_sisters && user.gender == 'female')
							) {
								continue userLoop
							}

							let affinities = await db.affinity.where({source_id: user.id}).toArray()
							if (affinities.length <= 0) {
								await db.assignment.add({
									user_id: user.id,
									turn_id: turn_id
								})
								await db.user.update(user.id, {
									counter: user.counter + user.weight
								})
								if (user.gender === 'male') {
									brothers++
								} else if (user.gender === 'female') {
									sisters++
								}
							}
						}
					}
					if (sisters < schedule.n_sisters) {
						new AlertToast({
							target: document.querySelector('#toast-container'),
							props: {
								alertStatus: 'warning',
								fadeDelay: 15000,
								alertMessage:
									$_('turns.not-enough-sis') +
									$_(
										'general.' +
											['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][d.getDay()]
									) +
									' ' +
									d.getDate() +
									' ' +
									schedule.start_time +
									' - ' +
									schedule.end_time
							}
						})
					}
					if (brothers < schedule.n_brothers) {
						new AlertToast({
							target: document.querySelector('#toast-container'),
							props: {
								alertStatus: 'warning',
								fadeDelay: 15000,
								alertMessage:
									$_('turns.not-enough-bro') +
									$_(
										'general.' +
											['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][d.getDay()]
									) +
									' ' +
									d.getDate() +
									' ' +
									schedule.start_time +
									' - ' +
									schedule.end_time
							}
						})
					}
				}
				userList = []
				brothers = 0
				sisters = 0
			}
		}
		new AlertToast({
			target: document.querySelector('#toast-container'),
			props: {alertStatus: 'success', alertMessage: $_('turns.created')}
		})
		fromDate = ''
		toDate = ''
		loading = false
		creationDisabled = false
	}

	async function checkPublisherTurn(user_id: number, d: Date) {
		//Check if user has availability
		if (!userList.includes(user_id)) {
			return true
		}

		//Check if user has an incidence
		const incidences = await db.incidence.where({user_id: user_id}).toArray()
		for (let incidence of incidences) {
			if (
				incidence.start_date <= d.toISOString().split('T')[0] &&
				incidence.end_date >= d.toISOString().split('T')[0]
			) {
				return true
			}
		}

		//Check if user already exist on turns at the same day
		const sameDayTurns = await db.turn.where({date: d.toISOString().split('T')[0]}).toArray()
		for (let sameDayTurn of sameDayTurns) {
			if ((await db.assignment.where({turn_id: sameDayTurn.id, user_id: user_id}).toArray()).length != 0) {
				return true
			}
		}

		//Check if user already exist on turns on the previous day
		const previousDay = new Date(d.toISOString())
		previousDay.setDate(previousDay.getDate() - 1)
		const previousTurns = await db.turn.where({date: previousDay.toISOString().split('T')[0]}).toArray()
		for (let previousDayTurn of previousTurns) {
			if ((await db.assignment.where({turn_id: previousDayTurn.id, user_id: user_id}).toArray()).length != 0) {
				return true
			}
		}

		return false
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

	async function exportToPDF() {
		window.print()
	}

	async function getAssignees(turn_id: number) {
		turnAssignees = []
		for (let assignment of $assignments) {
			if (assignment.turn_id == turn_id) {
				turnAssignees.push(assignment.user_id)
			}
		}
	}

	async function deleteYearlyTurns() {
		const tmpDate = new Date()
		tmpDate.setFullYear(tmpDate.getFullYear() - 3)
		const turns = await db.turn.where('date').belowOrEqual(tmpDate.toISOString().split('T')[0]).toArray()
		for (let turn of turns) {
			const tmpturnDate = new Date(turn.date)
			if (tmpturnDate <= tmpDate) {
				db.assignment.where({turn_id: turn.id}).delete()
				db.turn.delete(turn.id)
			}
		}
	}
</script>

<section class="mx-auto flex flex-col items-center justify-center px-6 py-8">
	<Card size="xl" class="mb-2 print:hidden">
		<div class="mb-4 mt-1 flex flex-row justify-between">
			<Label class="w-2/12">
				{$_('turns.from')}:
				<Input type="date" bind:value={fromDate} data-testid="turns-date-from" />
			</Label>
			<Label class="ml-1 mr-1 w-2/12">
				{$_('turns.to')}:
				<Input type="date" bind:value={toDate} data-testid="turns-date-to" />
			</Label>
			<Button
				color="green"
				class="ml-1 mr-1 w-4/12"
				on:click={generateTurns}
				disabled={creationDisabled}
				data-testid="turns-generate-btn"
			>
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
				data-testid="turns-create-btn"
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
				<Card size="xl" class="mt-5">
					<h1 class="text-center dark:text-white">{$_('turns.no-turns')}</h1>
				</Card>
			{:else}
				<TableSearch
					placeholder={$_('turns.search-by')}
					striped={true}
					hoverable={true}
					bind:inputValue={searchTerm}
					innerDivClass="p-4 print:hidden"
				>
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
													{#if name_order == 'firstname'}
														{#if user.gender == 'male'}
															<Badge color="blue" class="order-1 m-1">{user.firstname + ' ' + user.lastname}</Badge>
														{:else}
															<Badge color="pink" class="order-2 m-1">{user.firstname + ' ' + user.lastname}</Badge>
														{/if}
													{/if}
													{#if name_order == 'lastname'}
														{#if user.gender == 'male'}
															<Badge color="blue" class="order-1 m-1">{user.lastname + ' ' + user.firstname}</Badge>
														{:else}
															<Badge color="pink" class="order-2 m-1">{user.lastname + ' ' + user.firstname}</Badge>
														{/if}
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
</section>
