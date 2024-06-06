<script lang="ts">
	import {Card, Button, Label, Input, Modal, Select, Tooltip, DarkMode} from 'flowbite-svelte'
	import {CloudArrowUpSolid, DownloadSolid, ExclamationCircleOutline, InfoCircleSolid} from 'flowbite-svelte-icons'
	import {db} from '$lib/db'
	import {liveQuery} from 'dexie'
	import AlertToast from '$lib/components/AlertToast.svelte'
	import {exportDB, importInto} from 'dexie-export-import'
	import {locale, locales, _} from 'svelte-i18n'
	import {base} from '$app/paths'
	import {onMount} from 'svelte'
	import {nameOrder, weekOrder, mobile} from '$lib/stores'

	let deleteModal: boolean = false,
		importModal: boolean = false,
		files: FileList,
		langs: {value: string; name: string}[] = [],
		location: string = '',
		country: string = '',
		zipcode: string = ''

	$: week_order = [
		{value: 'monday', name: $_('general.monday')},
		{value: 'sunday', name: $_('general.sunday')}
	]

	$: name_order = [
		{value: 'firstname', name: $_('publishers.firstname')},
		{value: 'lastname', name: $_('publishers.lastname')}
	]

	const congregation = liveQuery(() => db.congregation.orderBy('id').first())

	onMount(async () => {
		const congregation = await db.congregation.orderBy('id').first()
		if (congregation?.lat && congregation?.lon && congregation?.lat != 0.0 && congregation?.lon != 0.0) {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/reverse.php?lat=${congregation.lat}&lon=${congregation.lon}&format=jsonv2&zoom=16&accept-language=${$locale}`
			)
			if (res.ok) {
				const json = await res.json()
				if (json.address.town) {
					location = json.address.town
				} else {
					location = json.address.city
				}
				country = json.address.country
				zipcode = json.address.postcode
			}
		}
	})

	$locales.forEach(lang => {
		langs.push({value: lang, name: $_('general.' + lang)})
	})

	langs.sort(function (a, b) {
		let textA = a.name.toUpperCase(),
			textB = b.name.toUpperCase()
		return textA < textB ? -1 : textA > textB ? 1 : 0
	})

	async function deleteCongregation() {
		await db.congregation.clear()
		await db.user.clear()
		await db.availability.clear()
		await db.incidence.clear()
		await db.schedule.clear()
		await db.turn.clear()
		await db.assignment.clear()
		await db.affinity.clear()
		window.location.href = base + '/'
	}

	async function updateCongregation() {
		if ($congregation) {
			if ($congregation?.name == '') {
				new AlertToast({
					target: document.querySelector('#toast-container'),
					props: {alertStatus: 'error', alertMessage: $_('general.invalid-data')}
				})
				return
			}
			let lat = 0.0
			let lon = 0.0
			if (location != '' && country != '' && zipcode != '') {
				const res = await fetch(
					`https://nominatim.openstreetmap.org/search.php?q=${encodeURIComponent(location + ' ' + zipcode + ' ' + country)}&format=jsonv2`
				)
				if (res.ok) {
					const json = await res.json()
					if (json.length >= 1) {
						lat = json[0].lat
						lon = json[0].lon
					}
				}
			}
			db.congregation.update($congregation?.id, {
				name: $congregation.name,
				lang: $congregation.lang,
				week_order: $congregation.week_order,
				name_order: $congregation.name_order,
				lat: lat,
				lon: lon
			})
			$locale = $congregation?.lang
			langs = []
			nameOrder.set($congregation.name_order)
			weekOrder.set($congregation.week_order)
			$locales.forEach(lang => {
				langs.push({value: lang, name: $_('general.' + lang)})
			})

			fetch(
				`https://nominatim.openstreetmap.org/reverse.php?lat=${lat}&lon=${lon}&format=jsonv2&zoom=16&accept-language=${$locale}`
			).then(async showRes => {
				if (showRes.ok) {
					const json = await showRes.json()
					if (json.address.town) {
						location = json.address.town
					} else {
						location = json.address.city
					}
					country = json.address.country
					zipcode = json.address.postcode
				}
			})

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
			props: {alertStatus: 'success', alertMessage: $_('settings.exported-successfully')}
		})
	}

	function importDataBtn() {
		const inputFile = document.getElementById('import')
		inputFile?.click()
	}

	async function importData() {
		await importInto(db, files[0], {clearTablesBeforeImport: true, overwriteValues: true}).then(async () => {
			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'success', alertMessage: $_('settings.imported-successfully')}
			})
			const importedCong = await db.congregation.orderBy('id').first()
			if (importedCong) {
				$locale = importedCong.lang
				nameOrder.set(importedCong.name_order)
				weekOrder.set(importedCong.week_order)
				langs = []
				$locales.forEach(lang => {
					langs.push({value: lang, name: $_('general.' + lang)})
				})
				window.location.reload()
			}
		})
	}
</script>

<section class="m-5 flex flex-col items-center">
	{#if $congregation}
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
					<Select items={langs} bind:value={$congregation.lang} />
				</Label>
				<Label class="space-y-2">
					<span>{$_('settings.week-start-at')}:</span>
					<Select items={week_order} bind:value={$congregation.week_order} />
				</Label>
				<Label class="space-y-2">
					<span>{$_('settings.name-order')}:</span>
					<Select items={name_order} bind:value={$congregation.name_order} />
				</Label>
				<Tooltip triggeredBy="#info-latitude" placement="left">{$_('settings.info-latitude')}</Tooltip>
				<div class="grid grid-cols-1 gap-1 md:grid-cols-3">
					<Label class="space-y-2">
						<div class="flex flex-row">
							<InfoCircleSolid id="info-latitude" class="mr-2" />
							<span>{$_('settings.city-or-town')}:</span>
						</div>
						<Input type="text" bind:value={location} />
					</Label>
					<Label class="space-y-2">
						<span>{$_('settings.zipcode')}:</span>
						<Input type="text" bind:value={zipcode} />
					</Label>
					<Label class="space-y-2">
						<span>{$_('settings.country')}:</span>
						<Input type="text" bind:value={country} />
					</Label>
					{#if $mobile}
						<Label class="space-y-2 text-center">
							<span>Mode:</span>
							<DarkMode class="black ml-2 border dark:border-gray-600 dark:text-primary-200" />
						</Label>
					{/if}
				</div>
				<Button color="blue" on:click={updateCongregation} data-testid="settings-update-btn"
					>{$_('settings.update-cong')}</Button
				>
				<Button color="red" on:click={() => (deleteModal = true)}>{$_('settings.delete-cong')}</Button>
				<hr class="my-2" />
				<input bind:files id="import" name="import" type="file" accept=".pgen" class="hidden" on:change={importData} />
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Button on:click={() => (importModal = true)} color="alternative">
						<CloudArrowUpSolid class="me-3 h-6 w-6" />
						{$_('settings.import')}
					</Button>
					<Button on:click={exportData} color="alternative">
						<DownloadSolid class="me-3 h-6 w-6" />
						{$_('settings.export')}
					</Button>
				</div>
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
	{/if}
</section>
