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
		TableHeadCell
	} from 'flowbite-svelte'
	import {ExclamationCircleOutline} from 'flowbite-svelte-icons'
	import {db} from '$lib/db'
	import {toastMessageSuccess, toastSuccess, toastMessageAlert, toastAlert} from '$lib/store'
	import {liveQuery} from 'dexie'
	import {_} from 'svelte-i18n'

	let createModal = false
	let deleteModal = false
	let edit = false
	let selectedId: number
	let searchTerm = ''
	let user_id = 0
	let userSelect: Array<{value: number; name: string}> = []
	let userList: string[] = []
	let now = new Date(),
		month,
		day,
		year
	let start_date = new Date().toISOString().split('T')[0]
	let end_date = new Date().toISOString().split('T')[0]

	let incidences = liveQuery(() => db.incidence.toArray())
	let users = db.user.toArray().then(() => {
		db.user.each(user => {
			userSelect.push({value: user.id, name: user.firstname + ' ' + user.lastname})
			userList[user.id] = user.firstname + ' ' + user.lastname
		})
	})

	$: filteredItems = $incidences?.filter(
		incidence => incidence.start_date.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
	)

	//TODO: Handle exceptions when start date is after end date
	async function createIncidence() {
		if (edit) {
			return editIncidence()
		}
		try {
			const maxUser = await db.user.orderBy('counter').last()
			let maxCounter = 0
			if (maxUser?.counter !== undefined) {
				maxCounter = maxUser?.counter
			}

			await db.incidence.add({
				user_id: user_id,
				start_date: start_date,
				end_date: end_date
			})

			$toastMessageSuccess = $_('incidences.created')
			$toastSuccess = true
			setTimeout(() => {
				$toastSuccess = false
			}, 8000)
		} catch (error) {
			$toastMessageAlert = $_('incidences.failed') + error
			$toastAlert = true
			setTimeout(() => {
				$toastAlert = false
			}, 8000)
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
		$toastMessageSuccess = $_('incidences.modified')
		$toastSuccess = true
		setTimeout(() => {
			$toastSuccess = false
		}, 8000)
		user_id = 0
		start_date = new Date().toISOString().split('T')[0]
		end_date = new Date().toISOString().split('T')[0]
		edit = false
	}

	async function deleteIncidence() {
		await db.incidence.delete(selectedId)
		$toastMessageSuccess = $_('incidences.deleted')
		$toastSuccess = true
		setTimeout(() => {
			$toastSuccess = false
		}, 8000)
	}
</script>

<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto">
	<Card size="xl">
		<Button
			color="blue"
			class="mt-1 mb-4"
			on:click={() => {
				createModal = true
				edit = false
				user_id = 0
				start_date = new Date().toISOString().split('T')[0]
				end_date = new Date().toISOString().split('T')[0]
			}}>{$_('incidences.create-btn')}</Button
		>
		{#if $incidences}
			{#if $incidences.length == 0}
				<Card size="xl" class="mt-5">
					<h1 class="text-center">{$_('incidences.no-incidences')}</h1>
				</Card>
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
								<TableBodyCell>{userList[incidence.user_id]}</TableBodyCell>
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

	<Modal bind:open={createModal} size="xs" autoclose outsideclose>
		<Label>
			{$_('incidences.publisher')}:
			<Select id="publisher" bind:value={user_id} items={userSelect} required />
		</Label>
		<Label>
			{$_('incidences.start-date')}:
			<Input type="date" id="start_date" bind:value={start_date} required />
		</Label>
		<Label>
			{$_('incidences.end-date')}:
			<Input type="date" id="end_date" bind:value={end_date} required />
		</Label>
		<div class="text-center">
			<Button color="red" class="me-2" on:click={createIncidence}>
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
			<ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
			<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
				{$_('incidences.are-you-sure')}
			</h3>
			<Button color="red" class="me-2" on:click={deleteIncidence}>{$_('general.yes-sure')}</Button>
			<Button color="alternative">{$_('general.no-cancel')}</Button>
		</div>
	</Modal>
</div>
