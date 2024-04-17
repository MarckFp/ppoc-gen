<script lang="ts">
	import {db} from '$lib/db'
	import AlertToast from './AlertToast.svelte'
	import {Button, Input, Select, Label} from 'flowbite-svelte'
	import {CloudArrowUpSolid} from 'flowbite-svelte-icons'
	import {importInto} from 'dexie-export-import'
	import {locale, locales, _} from 'svelte-i18n'

	let congregation_name: string, files: FileList, langs: {value: string, name: string}[] = [], currentLang: string

		
	$locales.forEach(lang => {
		langs.push({value: lang, name: $_('general.' + lang)})
	})
	currentLang = $locale?.split('-') [0]

	function changeLang () {
		$locale = currentLang
	}

	async function createCongregation() {
		try {
			await db.congregation.add({
				name: congregation_name,
				lang: currentLang,
				theme: 'light'
			})

			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'success', alertMessage: $_('settings.created-successfully')}
			})
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
			new AlertToast({
				target: document.querySelector('#toast-container'),
				props: {alertStatus: 'success', alertMessage: $_('settings.imported-successfully')}
			})
		})
	}
</script>

<main>
	<section class="bg-gray-50 dark:bg-gray-900">
		<div class="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
			<a href="/" class="mb-6 flex items-center text-2xl font-semibold text-gray-900 dark:text-white">
				<img class="mr-2 h-8 w-8" src="favicon.ico" alt="logo" />
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
							<Label for="name">
								{$_('settings.cong-name')}:
								<Input
									name="name"
									id="name"
									class="block mt-2 mb-2 w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
									placeholder="Warwick"
									required
									bind:value={congregation_name}
								/>
							</Label>
							<Label>
								{$_('settings.language')}:
								<Select items={langs} bind:value={currentLang} on:change={changeLang} class="mt-2"/>
							</Label>
						</div>
						<Button class="w-full" on:click={createCongregation}>{$_('settings.create-cong')}</Button>
						<p class="text-center">- {$_('settings.or')} -</p>
						<input
							bind:files
							id="import"
							name="import"
							type="file"
							accept=".pgen"
							class="hidden"
							on:change={importData}
						/>
						<Button class="w-full" on:click={importDataBtn}>
							<CloudArrowUpSolid class="me-3 h-6 w-6" />
							{$_('settings.import')}
						</Button>
						<p class="text-sm font-light text-gray-500 dark:text-gray-400">
							{$_('settings.read-official')}
							<a href="/documentation" class="font-medium text-primary-600 hover:underline dark:text-primary-500"
								>{$_('settings.documentation')}</a
							>
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>
</main>
