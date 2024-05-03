<script lang="ts">
	import {Card, Button, Label, Input, ButtonGroup, Modal, Select, Tooltip} from 'flowbite-svelte'
	import {CloudArrowUpSolid, DownloadSolid, ExclamationCircleOutline, InfoCircleSolid} from 'flowbite-svelte-icons'
	import {db} from '$lib/db'
	import {liveQuery} from 'dexie'
	import {goto, invalidateAll} from '$app/navigation'
	import AlertToast from '$lib/components/AlertToast.svelte'
	import {exportDB, importInto} from 'dexie-export-import'
	import {locale, locales, _} from 'svelte-i18n'
	import {base} from '$app/paths'

	let deleteModal: boolean = false,
		importModal: boolean = false,
		files: FileList,
		langs: {value: string; name: string}[] = []

	$: week_order = [
		{value: 'monday', name: $_('general.monday')},
		{value: 'sunday', name: $_('general.sunday')}
	]

	$: name_order = [
		{value: 'firstname', name: $_('publishers.firstname')},
		{value: 'lastname', name: $_('publishers.lastname')}
	]

	const congregation = liveQuery(() => db.congregation.orderBy('id').first())

	$locales.forEach(lang => {
		langs.push({value: lang, name: $_('general.' + lang)})
	})

	function changeLang() {
		$locale = $congregation?.lang
	}

	async function deleteCongregation() {
		await db.congregation.clear()
		await db.user.clear()
		await db.availability.clear()
		await db.incidence.clear()
		await db.schedule.clear()
		await db.turn.clear()
		await db.assignment.clear()
		await db.affinity.clear()
		await invalidateAll()
		goto(base)
		new AlertToast({
			target: document.querySelector('#toast-container'),
			props: {alertStatus: 'success', alertMessage: 'Congregation deleted successfully'}
		})
	}

	function updateCongregation() {
		if ($congregation) {
			if ($congregation?.name == '') {
				new AlertToast({
					target: document.querySelector('#toast-container'),
					props: {alertStatus: 'error', alertMessage: $_('general.invalid-data')}
				})
				return
			}
			db.congregation.update($congregation?.id, $congregation)
			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'success', alertMessage: $_('settings.updated-successfully')}
			})
		}
	}

	async function exportData() {
		const blob: Blob = await exportDB(db)
		var url = window.URL || window.webkitURL
		let link: string = url.createObjectURL(blob),
			a: HTMLAnchorElement = document.createElement('a')
		a.setAttribute('download', `ppoc-gen-${Date.now()}.pgen`)
		a.setAttribute('href', link)
		a.click()
		new AlertToast({
			target: document.querySelector('#toast-container'),
			props: {alertStatus: 'error', alertMessage: $_('settings.exported-successfully')}
		})
	}

	function importDataBtn() {
		const inputFile = document.getElementById('import')
		inputFile?.click()
	}

	async function importData() {
		await importInto(db, files[0], {clearTablesBeforeImport: true, overwriteValues: true}).then(() => {
			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'success', alertMessage: $_('settings.imported-successfully')}
			})
		})
	}
</script>

<div class="mx-auto px-6 py-8">
	{#if $congregation}
		<div class="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-5/6 lg:py-0">
			<Card size="xl">
				<h3 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
					{$_('settings.cong-settings')}
				</h3>
				<div class="flex flex-col space-y-6">
					<Label class="space-y-2">
						<span>{$_('settings.cong-name')}:</span>
						<Input type="text" name="name" bind:value={$congregation.name} required />
					</Label>
					<Label class="space-y-2">
						<span>{$_('settings.language')}:</span>
						<Select items={langs} on:change={changeLang} bind:value={$congregation.lang} />
					</Label>
					<Label class="space-y-2">
						<span>{$_('settings.week-start-at')}:</span>
						<Select items={week_order} bind:value={$congregation.week_order} />
					</Label>
					<Label class="space-y-2">
						<span>{$_('settings.name-order')}:</span>
						<Select items={name_order} bind:value={$congregation.name_order} />
					</Label>
					<div class="grid gap-6 md:grid-cols-2">
						<Tooltip triggeredBy="#info-latitude" placement="left">{$_('settings.info-latitude')}</Tooltip>
						<Label class="space-y-2">
							<div class="flex flex-row">
								<InfoCircleSolid id="info-latitude" class="mr-2" />
								<span>{$_('settings.latitude')}:</span>
							</div>
							<Input type="text" bind:value={$congregation.lat} />
						</Label>
						<Label class="space-y-2">
							<span>{$_('settings.longitude')}:</span>
							<Input type="text" bind:value={$congregation.lon} />
						</Label>
					</div>
					<Button color="blue" on:click={updateCongregation} data-testid="settings-update-btn"
						>{$_('settings.update-cong')}</Button
					>
					<Button color="red" on:click={() => (deleteModal = true)}>{$_('settings.delete-cong')}</Button>
					<input
						bind:files
						id="import"
						name="import"
						type="file"
						accept=".pgen"
						class="hidden"
						on:change={importData}
					/>
					<ButtonGroup class="flex justify-center">
						<Button on:click={() => (importModal = true)}>
							<CloudArrowUpSolid class="me-3 h-6 w-6" />
							{$_('settings.import')}
						</Button>
						<Button on:click={exportData}>
							<DownloadSolid class="me-3 h-6 w-6" />
							{$_('settings.export')}
						</Button>
					</ButtonGroup>
				</div>
			</Card>

			<Modal bind:open={deleteModal} size="xs" autoclose>
				<div class="text-center">
					<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />
					<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
						{$_('settings.are-you-sure')}
					</h3>
					<Button color="red" class="me-2" on:click={deleteCongregation}>{$_('general.yes-sure')}</Button>
					<Button color="alternative">{$_('general.no-cancel')}</Button>
				</div>
			</Modal>

			<Modal bind:open={importModal} size="xs" autoclose>
				<div class="text-center">
					<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />
					<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
						{$_('settings.are-you-sure-import')}
					</h3>
					<Button color="red" class="me-2" on:click={importDataBtn}>{$_('general.yes-sure')}</Button>
					<Button color="alternative">{$_('general.no-cancel')}</Button>
				</div>
			</Modal>
		</div>
	{/if}
</div>
