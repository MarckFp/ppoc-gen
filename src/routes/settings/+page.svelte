<script lang="ts">
	import {Card, Button, Label, Input, ButtonGroup, Modal, Select} from 'flowbite-svelte'
	import {CloudArrowUpSolid, DownloadSolid, ExclamationCircleOutline} from 'flowbite-svelte-icons'
	import {db} from '$lib/db'
	import {liveQuery} from 'dexie'
	import {goto, invalidateAll} from '$app/navigation'
	import {toastMessageSuccess, toastSuccess} from '$lib/store'
	import {exportDB, importInto} from 'dexie-export-import'
	import {locale, locales, _} from 'svelte-i18n'

	let deleteModal = false
	let importModal = false
	let files: FileList

	async function deleteCongregation() {
		await db.congregation.clear()
		await db.user.clear()
		await db.availability.clear()
		await db.incidence.clear()
		await db.schedule.clear()
		await db.turn.clear()
		await invalidateAll()
		goto('/')
	}

	let congregation = liveQuery(() => db.congregation.toArray())

	let langs = []
	$locales.forEach(lang => {
		langs.push({value: lang, name: $_('general.' + lang)})
	})

	function updateCongregation() {
		db.congregation.update($congregation[0].id, $congregation[0])
		$toastMessageSuccess = $_('settings.updated-successfully')
		$toastSuccess = true
		setTimeout(() => {
			$toastSuccess = false
		}, 8000)
	}

	async function exportData() {
		const blob = await exportDB(db)
		var url = window.URL || window.webkitURL
		let link = url.createObjectURL(blob)
		let a = document.createElement('a')
		a.setAttribute('download', `ppoc-gen-${Date.now()}`)
		a.setAttribute('href', link)
		a.click()
	}

	function importDataBtn() {
		const inputFile = document.getElementById('import')
		inputFile?.click()
	}

	async function importData() {
		await importInto(db, files[0], {clearTablesBeforeImport: true, overwriteValues: true}).then(() => {
			$toastMessageSuccess = $_('settings.imported-successfully')
			$toastSuccess = true
		})

		setTimeout(() => {
			$toastSuccess = false
		}, 8000)
	}
</script>

{#if $congregation}
	<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-5/6 lg:py-0">
		<Card size="lg">
			<h3 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
				{$_('settings.cong-settings')}
			</h3>
			<form class="flex flex-col space-y-6" action="/">
				<Label class="space-y-2">
					<span>{$_('settings.cong-name')}:</span>
					<Input type="text" name="name" bind:value={$congregation[0].name} required />
				</Label>
				<Label class="space-y-2">
					<span>{$_('settings.n-carts')}:</span>
					<Input type="number" name="n_carts" min="1" max="99" bind:value={$congregation[0].n_carts} required />
				</Label>
				<Label class="space-y-2">
					<span>{$_('settings.language')}:</span>
					<Select items={langs} bind:value={$locale} />
				</Label>
				<Button color="blue" on:click={updateCongregation}>{$_('settings.update-cong')}</Button>
				<Button color="red" on:click={() => (deleteModal = true)}>{$_('settings.delete-cong')}</Button>
				<input bind:files id="import" name="import" type="file" class="hidden" on:change={importData} />
				<ButtonGroup class="flex justify-center">
					<Button on:click={() => (importModal = true)}>
						<CloudArrowUpSolid class="w-6 h-6 me-3" />
						{$_('settings.import')}
					</Button>
					<Button on:click={exportData}>
						<DownloadSolid class="w-6 h-6 me-3" />
						{$_('settings.export')}
					</Button>
				</ButtonGroup>
			</form>
		</Card>

		<Modal bind:open={deleteModal} size="xs" autoclose>
			<div class="text-center">
				<ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
				<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
					{$_('settings.are-you-sure')}
				</h3>
				<Button color="red" class="me-2" on:click={deleteCongregation}>{$_('general.yes-sure')}</Button>
				<Button color="alternative">{$_('general.no-cancel')}</Button>
			</div>
		</Modal>

		<Modal bind:open={importModal} size="xs" autoclose>
			<div class="text-center">
				<ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
				<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
					{$_('settings.are-you-sure-import')}
				</h3>
				<Button color="red" class="me-2" on:click={importDataBtn}>{$_('general.yes-sure')}</Button>
				<Button color="alternative">{$_('general.no-cancel')}</Button>
			</div>
		</Modal>
	</div>
{/if}
