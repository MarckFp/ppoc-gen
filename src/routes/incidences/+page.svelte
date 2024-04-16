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
	import AlertToast from '$lib/components/AlertToast.svelte'
	import {liveQuery} from 'dexie'
	import {_} from 'svelte-i18n'

	let createModal: boolean = false,
		deleteModal: boolean = false,
		edit: boolean = false,
		selectedId: number,
		searchTerm: string = '',
		user_id: number = 0,
		userSelect: {value: number; name: string}[] = [],
		userList: string[] = [],
		start_date: string = new Date().toISOString().split('T')[0],
		end_date: string = new Date().toISOString().split('T')[0]

	let incidences = liveQuery(() => db.incidence.toArray())
	db.user.each(user => {
		userSelect.push({value: user.id, name: user.firstname + ' ' + user.lastname})
		userList[user.id] = user.firstname + ' ' + user.lastname
	})

	$: filteredItems = $incidences?.filter(
		incidence => incidence.start_date.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
	)

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
</script>

<div class="mx-auto flex flex-col items-center justify-center px-6 py-8">
	<Card size="xl">
		<Button
			color="blue"
			class="mb-4 mt-1"
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
			<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />
			<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
				{$_('incidences.are-you-sure')}
			</h3>
			<Button color="red" class="me-2" on:click={deleteIncidence}>{$_('general.yes-sure')}</Button>
			<Button color="alternative">{$_('general.no-cancel')}</Button>
		</div>
	</Modal>
</div>
