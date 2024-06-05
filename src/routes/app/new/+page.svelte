<script lang="ts">
	import {db} from '$lib/db'
	import AlertToast from '$lib/components/AlertToast.svelte'
	import {Button, Input, Select, Label} from 'flowbite-svelte'
	import {CloudArrowUpSolid} from 'flowbite-svelte-icons'
	import {importInto} from 'dexie-export-import'
	import {locale, locales, _} from 'svelte-i18n'
	import {base} from '$app/paths'

	let congregation_name: string,
		files: FileList,
		langs: {value: string; name: string}[] = [],
		currentLang: string,
		mobile: boolean = false,
		week_order_cong = 'monday',
		name_order_cong = 'firstname'

	db.congregation
		.orderBy('id')
		.first()
		.then(cong => {
			if (cong) {
				window.location.pathname = base + '/app/home'
			}
		})

	$: week_order = [
		{value: 'monday', name: $_('general.monday')},
		{value: 'sunday', name: $_('general.sunday')}
	]

	$: name_order = [
		{value: 'firstname', name: $_('publishers.firstname')},
		{value: 'lastname', name: $_('publishers.lastname')}
	]

	$locales.forEach(lang => {
		langs.push({value: lang, name: $_('general.' + lang)})
	})

	langs.sort(function (a, b) {
		let textA = a.name.toUpperCase(),
			textB = b.name.toUpperCase()
		return textA < textB ? -1 : textA > textB ? 1 : 0
	})

	currentLang = $locale?.split('-')[0]

	function changeLang() {
		langs = []
		$locale = currentLang
		$locales.forEach(lang => {
			langs.push({value: lang, name: $_('general.' + lang)})
		})
	}

	async function createCongregation() {
		if (congregation_name == undefined || congregation_name == '') {
			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('general.invalid-data')}
			})
			return
		}
		try {
			await db.congregation.add({
				name: congregation_name,
				lang: currentLang,
				week_order: week_order_cong,
				lat: 0.0,
				lon: 0.0,
				name_order: name_order_cong
			})

			window.location.pathname = base + '/app/home'
		} catch (error) {
			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'error', alertMessage: $_('settings.create-failed') + error}
			})
		}
	}

	function importDataBtn() {
		const inputFile = document.getElementById('import')
		inputFile?.click()
	}

	async function importData() {
		await importInto(db, files[0], {clearTablesBeforeImport: true, overwriteValues: true}).then(() => {
			window.location.pathname = base + '/app/home'
		})
	}

	//Media Queries for Calendar View
	const mediaQuery = window.matchMedia('(width <= 640px)')
	mediaQuery.addEventListener('change', ({matches}) => {
		if (matches) {
			mobile = true
		} else {
			mobile = false
		}
	})
	if (mediaQuery.matches) {
		mobile = true
	} else {
		mobile = false
	}
</script>

<div id="toast-container" class="fixed bottom-0 right-0 z-50 {mobile ? 'mb-20' : ''}"></div>

<section>
	<div class="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
		<a href="/" class="mb-6 flex items-center text-2xl font-semibold text-gray-900 dark:text-white">
			<img class="mr-2 h-8 w-8" src="/favicon.svg" alt="logo" />
			PPOC Gen
		</a>
		<div
			class="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0"
		>
			<div class="space-y-4 p-6 sm:p-8 md:space-y-6">
				<h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
					{$_('settings.create-new-cong')}
				</h1>
				<div class="space-y-4 md:space-y-6">
					<div>
						<Label class="mb-2">
							{$_('settings.cong-name')}:
							<Input
								name="name"
								id="name"
								class="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
								placeholder="Warwick"
								required
								bind:value={congregation_name}
								data-testid="create-name"
							/>
						</Label>
						<Label class="mb-2">
							{$_('settings.language')}:
							<Select
								items={langs}
								bind:value={currentLang}
								on:change={changeLang}
								class="mt-2"
								data-testid="create-lang"
							/>
						</Label>
						<Label class="mb-2">
							{$_('settings.week-start-at')}:
							<Select items={week_order} bind:value={week_order_cong} class="mt-2" data-testid="create-weekday" />
						</Label>
						<Label class="mb-2">
							{$_('settings.name-order')}:
							<Select items={name_order} bind:value={name_order_cong} class="mt-2" data-testid="create-name-order" />
						</Label>
					</div>
					<Button class="w-full" on:click={createCongregation} data-testid="create-btn"
						>{$_('settings.create-cong')}</Button
					>
					<p class="text-center dark:text-white">- {$_('settings.or')} -</p>
					<input
						bind:files
						id="import"
						name="import"
						type="file"
						accept=".pgen"
						class="hidden"
						on:change={importData}
					/>
					<Button class="w-full" on:click={importDataBtn} data-testid="create-import">
						<CloudArrowUpSolid class="me-3 h-6 w-6" />
						{$_('settings.import')}
					</Button>
					<p class="text-sm font-light text-gray-500 dark:text-gray-400">
						{$_('settings.read-official')}
						<a
							href="https://github.com/MarckFp/ppoc-gen/blob/main/docs/README.md"
							class="font-medium text-primary-600 hover:underline dark:text-primary-500"
							>{$_('settings.documentation')}</a
						>
					</p>
				</div>
			</div>
		</div>
	</div>
</section>
