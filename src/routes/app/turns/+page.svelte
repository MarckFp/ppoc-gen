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
		Dropdown,
		DropdownItem,
		Search,
		Radio
	} from 'flowbite-svelte'
	import {
		ExclamationCircleOutline,
		ArrowLeftOutline,
		ArrowRightOutline,
		FileExportSolid,
		DotsHorizontalOutline
	} from 'flowbite-svelte-icons'
	import AlertToast from '$lib/components/AlertToast.svelte'
	import {db} from '$lib/db'
	import {liveQuery} from 'dexie'
	import {_} from 'svelte-i18n'
	import {onMount} from 'svelte'
	import {jsPDF} from 'jspdf'
	import {genTurnsLoading, genTurnsButtonDisabled, nameOrder, mobile} from '$lib/stores'
	import autoTable from 'jspdf-autotable'
	import ical from 'ical-generator'
	import genTurnsWorker from '$lib/workers/gen-turns?worker'

	var date: Date = new Date()
	let fromDate: string,
		toDate: string,
		printFromDate: string,
		printToDate: string,
		printType: string,
		userSelect: {value: number; name: string}[] = [],
		deleteModal: boolean = false,
		createModal: boolean = false,
		printModal: boolean = false,
		edit: boolean = false,
		userList: string[] = [],
		searchTerm: string = '',
		query_name_order = 'firstname+lastname',
		modalTitle = $_('general.create-btn'),
		selectedId: number,
		turnDate: string,
		turnStartTime: string,
		turnEndTime: string,
		turnLocation: string,
		turnAssignees: number[],
		turnAssigneesList: {value: number; name: string; color: string}[] = [],
		TurnsWorker: Worker

	if ($nameOrder == 'firstname') {
		query_name_order = 'firstname+lastname'
	} else if ($nameOrder == 'lastname') {
		query_name_order = 'lastname+firstname'
	}

	onMount(async () => {
		TurnsWorker = new genTurnsWorker()

		TurnsWorker.addEventListener('message', e => {
			const {type, message} = e.data

			let toastMessage = ''

			switch (message.type) {
				case 'turns.cong-inc':
					toastMessage = `${$_('general.' + message.payload.weekday)} ${message.payload.date} ${$_('turns.cong-inc')}`
					break
				case 'turns.no-availability':
					toastMessage = $_('turns.no-availability') + $_('general.' + message.payload.weekday)
					break
				case 'turns.no-publishers':
					toastMessage =
						$_('turns.no-publishers') +
						$_(
							'general.' +
								['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][message.payload.day]
						) +
						' ' +
						message.payload.date +
						' ' +
						message.payload.start_time +
						' - ' +
						message.payload.end_time
					break
				case 'turns.not-enough-sis':
					toastMessage =
						$_('turns.not-enough-sis') +
						$_(
							'general.' +
								['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][message.payload.day]
						) +
						' ' +
						message.payload.date +
						' ' +
						message.payload.start_time +
						' - ' +
						message.payload.end_time
					break
				case 'turns.not-enough-bro':
					toastMessage =
						$_('turns.not-enough-bro') +
						$_(
							'general.' +
								['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][message.payload.day]
						) +
						' ' +
						message.payload.date +
						' ' +
						message.payload.start_time +
						' - ' +
						message.payload.end_time
					break
				case 'turns.created':
					toastMessage = $_('turns.created')
					genTurnsLoading.set(false)
					genTurnsButtonDisabled.set(false)
					break
			}

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: type, alertMessage: toastMessage}
			})
		})

		db.user.orderBy(`[${query_name_order}]`).each(user => {
			if (user.id != undefined) {
				if ($nameOrder == 'firstname') {
					if (user.gender == 'male') {
						turnAssigneesList.push({value: user.id, name: user.firstname + ' ' + user.lastname, color: 'blue'})
					} else {
						turnAssigneesList.push({value: user.id, name: user.firstname + ' ' + user.lastname, color: 'pink'})
					}
					userSelect.push({value: user.id, name: user.firstname + ' ' + user.lastname})
					userList[user.id] = user.firstname + ' ' + user.lastname
				} else if ($nameOrder == 'lastname') {
					if (user.gender == 'male') {
						turnAssigneesList.push({value: user.id, name: user.lastname + ' ' + user.firstname, color: 'blue'})
					} else {
						turnAssigneesList.push({value: user.id, name: user.lastname + ' ' + user.firstname, color: 'pink'})
					}
					userSelect.push({value: user.id, name: user.lastname + ' ' + user.firstname})
					userList[user.id] = user.lastname + ' ' + user.firstname
				}
			}
		})
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
		genTurnsLoading.set(true)
		genTurnsButtonDisabled.set(true)
		if (fromDate == undefined || toDate == undefined || fromDate == '' || toDate == '') {
			fromDate = ''
			toDate = ''
			genTurnsLoading.set(false)
			genTurnsButtonDisabled.set(false)

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
			genTurnsLoading.set(false)
			genTurnsButtonDisabled.set(false)

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('turns.from-bigger-to')}
			})
			return
		}

		TurnsWorker.postMessage({
			type: 'generate',
			payload: {from: from, to: to, userList: userList, schedules: $schedules}
		})

		fromDate = ''
		toDate = ''
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

	async function exportTurns() {
		if (printFromDate == undefined || printToDate == undefined || printFromDate == '' || printToDate == '') {
			printFromDate = ''
			printToDate = ''
			printType = ''

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('turns.date-invalid')}
			})
			return
		}
		let from: Date = new Date(printFromDate),
			to: Date = new Date(printToDate),
			printAssignees = [],
			printAssignments = [],
			printUser

		if (from > to) {
			printFromDate = ''
			printToDate = ''
			printType = ''

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('turns.from-bigger-to')}
			})
			return
		}

		if (printType == '' || printType == undefined) {
			printFromDate = ''
			printToDate = ''
			printType = ''

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('turns.valid-options-err')}
			})
			return
		}
		if (printType == 'pdf') {
			const doc = new jsPDF({orientation: 'landscape', format: 'a4'})
			let pageWidth = doc.internal.pageSize.width,
				wantedTableWidth = pageWidth - 15,
				margin = (pageWidth - wantedTableWidth) / 2,
				body = []

			const printTurns = await db.turn
				.where('date')
				.between(
					new Date(date.getFullYear(), date.getMonth(), 2).toISOString().split('T')[0],
					new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().split('T')[0]
				)
				.toArray()
			for (let turn of printTurns) {
				printAssignees = []
				printAssignments = await db.assignment.where('turn_id').equals(turn.id).toArray()
				for (let assignment of printAssignments) {
					printUser = await db.user.where('id').equals(assignment.user_id).first()
					if ($nameOrder == 'firstname') {
						printAssignees.push(printUser?.firstname + ' ' + printUser?.lastname)
					} else if ($nameOrder == 'lastname') {
						printAssignees.push(printUser?.lastname + ' ' + printUser?.firstname)
					}
				}
				body.push([
					$_(
						'general.' +
							['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
								new Date(turn.date).getDay()
							]
					) +
						' ' +
						new Date(turn.date).getDate(),
					turn.start_time + ' - ' + turn.end_time,
					turn.location,
					printAssignees.join(' | ')
				])
			}

			doc.text(
				`${from.getDate()} ${$_('general.' + from.toLocaleString('en', {month: 'long'}).toLowerCase())} - ${to.getDate()} ${$_('general.' + from.toLocaleString('en', {month: 'long'}).toLowerCase())}`,
				20,
				20
			)
			autoTable(doc, {
				theme: 'grid',
				startY: 25,
				head: [[$_('turns.day'), $_('turns.time'), $_('schedule.location'), $_('turns.assignees')]],
				body: body,
				margin: {left: margin, right: margin}
			})
			doc.save('ppoc-gen.pdf')
		} else if (printType == 'ics') {
			const iCal = ical({name: 'PPOC Gen'})

			const printTurns = await db.turn
				.where('date')
				.between(
					new Date(date.getFullYear(), date.getMonth(), 2).toISOString().split('T')[0],
					new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().split('T')[0]
				)
				.toArray()
			for (let turn of printTurns) {
				printAssignees = []
				printAssignments = await db.assignment.where('turn_id').equals(turn.id).toArray()
				for (let assignment of printAssignments) {
					printUser = await db.user.where('id').equals(assignment.user_id).first()
					if ($nameOrder == 'firstname') {
						printAssignees.push(printUser?.firstname + ' ' + printUser?.lastname)
					} else if ($nameOrder == 'lastname') {
						printAssignees.push(printUser?.lastname + ' ' + printUser?.firstname)
					}
				}

				iCal.createEvent({
					start: new Date(turn.date + ' ' + turn.start_time),
					end: new Date(turn.date + ' ' + turn.end_time),
					summary: turn.location + ' ' + turn.start_time + '-' + turn.end_time,
					description: printAssignees.join('\n'),
					location: turn.location
				})
			}
			const icsFile = new Blob([iCal.toString()], {
				type: 'text/calendar'
			})
			var url = window.URL || window.webkitURL
			let link: string = url.createObjectURL(icsFile),
				a: HTMLAnchorElement = document.createElement('a')
			a.setAttribute('download', `ppoc-gen.ics`)
			a.setAttribute('href', link)
			a.click()
		}
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

<svelte:head>
	<title>PPOC Gen - {$_('navbar.turns')}</title>
</svelte:head>

<section class="mx-auto flex flex-col items-center justify-center px-6 py-8">
	<Card size="xl" class="mb-2 print:hidden">
		<div class="mb-4 mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
			<Label>
				{$_('turns.from')}:
				<Input type="date" bind:value={fromDate} data-testid="turns-date-from" class="mt-2" />
			</Label>
			<Label>
				{$_('turns.to')}:
				<Input type="date" bind:value={toDate} data-testid="turns-date-to" class="mt-2" />
			</Label>
			<Button
				color="green"
				on:click={generateTurns}
				disabled={$genTurnsButtonDisabled}
				data-testid="turns-generate-btn"
			>
				{#if $genTurnsLoading}
					<Spinner class="me-3" size="4" color="white" />
					{$_('turns.creating')}
				{:else}
					{$_('turns.generate-btn')}
				{/if}
			</Button>
			<Button
				color="blue"
				data-testid="turns-create-btn"
				on:click={() => {
					createModal = true
					edit = false
					turnAssignees = []
					turnLocation = ''
					turnDate = ''
					turnStartTime = ''
					turnEndTime = ''
					modalTitle = $_('general.create-btn')
				}}
			>
				{$_('turns.create-btn')}
			</Button>
		</div>
	</Card>
	{#if $turns && $schedules && $assignments && $showUsers}
		<Card size="xl" class="mt-2">
			{#if $mobile}
				<Badge border class="my-2 text-lg print:hidden">
					{$_('general.' + date.toLocaleString('en', {month: 'long'}).toLowerCase())}
					{date.getFullYear()}
				</Badge>
			{/if}
			<div class="my-2 grid {$mobile ? 'grid-cols-4' : 'grid-cols-5'} gap-4 print:hidden">
				<Button
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
				{#if !$mobile}
					<Badge border class="text-lg">
						{$_('general.' + date.toLocaleString('en', {month: 'long'}).toLowerCase())}
						{date.getFullYear()}
					</Badge>
				{/if}
				<Button on:click={() => (printModal = true)} aria-label="Export to PDF"
					><FileExportSolid></FileExportSolid></Button
				>
				<Button
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
			{#if $mobile}
				<div class="my-2 print:hidden">
					<Search size="md" bind:value={searchTerm} placeholder={$_('turns.search-by')} />
				</div>
			{/if}
			{#if $turns.length == 0 || $schedules.length == 0}
				<Card size="xl" class="mt-5">
					<h1 class="text-center dark:text-white">{$_('turns.no-turns')}</h1>
				</Card>
			{:else if $mobile}
				<div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-4">
					{#each filteredItems as turn}
						<Card padding="none" class="p-2 print:hidden" size="xl">
							<div class="flex justify-end">
								<DotsHorizontalOutline />
								<Dropdown class="p-1">
									<DropdownItem
										id="edit-{turn.id}"
										on:click={async () => {
											createModal = true
											edit = true
											turnLocation = turn.location
											turnDate = turn.date
											turnStartTime = turn.start_time
											turnEndTime = turn.end_time
											selectedId = turn.id
											modalTitle = $_('general.edit-btn')
											await getAssignees(turn.id)
										}}
									>
										{$_('general.edit-btn')}
									</DropdownItem>
									<DropdownItem
										id="delete-{turn.id}"
										on:click={() => {
											deleteModal = true
											selectedId = turn.id
										}}
										>{$_('general.delete-btn')}
									</DropdownItem>
								</Dropdown>
							</div>
							<div class="my-2 grid grid-cols-2 gap-2 text-center">
								<div>
									🗓️ {$_(
										'general.' +
											['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
												new Date(turn.date).getDay()
											]
									) +
										' ' +
										new Date(turn.date).getDate()}
								</div>
								<div>🕑 {turn.start_time + ' - ' + turn.end_time}</div>
							</div>
							<div class="my-2 text-center">📍 {turn.location}</div>
							<hr />
							<div class="my-2 grid grid-cols-2 text-center text-gray-900 dark:text-white sm:grid-cols-4">
								{#each $assignments as assignment}
									{#if assignment.turn_id == turn.id}
										{#if assignment.user_id === -1}
											<Badge color="yellow" class="m-1">{$_('turns.deleted-pub')}</Badge>
										{/if}
										{#each $showUsers as user}
											{#if user.id == assignment.user_id}
												{#if $nameOrder == 'firstname'}
													{#if user.gender == 'male'}
														<Badge color="blue" class="order-1 m-1">{user.firstname + ' ' + user.lastname}</Badge>
													{:else}
														<Badge color="pink" class="order-2 m-1">{user.firstname + ' ' + user.lastname}</Badge>
													{/if}
												{:else if $nameOrder == 'lastname'}
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
							</div>
						</Card>
					{/each}
				</div>
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
													{#if $nameOrder == 'firstname'}
														{#if user.gender == 'male'}
															<Badge color="blue" class="order-1 m-1">{user.firstname + ' ' + user.lastname}</Badge>
														{:else}
															<Badge color="pink" class="order-2 m-1">{user.firstname + ' ' + user.lastname}</Badge>
														{/if}
													{:else if $nameOrder == 'lastname'}
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
											modalTitle = $_('general.edit-btn')
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

		<Modal title={$_('turns.export')} bind:open={printModal} size="lg" autoclose outsideclose>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<Label>
					{$_('turns.from')}:
					<Input type="date" bind:value={printFromDate} data-testid="turns-date-from" class="mt-2" />
				</Label>
				<Label>
					{$_('turns.to')}:
					<Input type="date" bind:value={printToDate} data-testid="turns-date-to" class="mt-2" />
				</Label>
			</div>
			<div class="text-center">
				<p class="mb-5 text-lg font-medium text-gray-900 dark:text-white">{$_('turns.type')}:</p>
				<div class="my-4 grid w-full grid-cols-1 gap-4 md:grid-cols-2">
					<Radio name="custom" custom value="pdf" bind:group={printType}>
						<div
							class="inline-flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-5 text-gray-500 hover:bg-gray-100 hover:text-gray-600 peer-checked:border-primary-600 peer-checked:text-primary-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:peer-checked:text-primary-500"
						>
							<div>
								<div class="w-full text-lg font-semibold">PDF</div>
								<div class="w-full">{$_('turns.pdf-desc')}</div>
							</div>
							<ArrowRightOutline class="ms-3 h-10 w-10" />
						</div>
					</Radio>
					<Radio name="custom" custom value="ics" bind:group={printType}>
						<div
							class="inline-flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-5 text-gray-500 hover:bg-gray-100 hover:text-gray-600 peer-checked:border-primary-600 peer-checked:text-primary-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:peer-checked:text-primary-500"
						>
							<div class="block">
								<div class="w-full text-lg font-semibold">ICS</div>
								<div class="w-full">{$_('turns.ics-desc')}</div>
							</div>
							<ArrowRightOutline class="ms-3 h-10 w-10" />
						</div>
					</Radio>
				</div>
				<Button color="red" class="me-2" on:click={exportTurns}>{$_('general.yes-sure')}</Button>
				<Button color="alternative">{$_('general.no-cancel')}</Button>
			</div>
		</Modal>

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

		<Modal title={modalTitle} bind:open={createModal} size="xs" autoclose outsideclose>
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
