<script lang="ts">
	import { db } from '$lib/db';
	import { toastMessageSuccess, toastSuccess, toastMessageAlert, toastAlert } from '$lib/store';
	import { Button } from 'flowbite-svelte';
	import { CloudArrowUpSolid } from 'flowbite-svelte-icons';
	import { importInto } from 'dexie-export-import';

	let congregation_name: string,
		files: FileList,
		n_carts: number = 1;

	async function createCongregation() {
		try {
			const id = await db.congregation.add({
				name: congregation_name,
				n_carts: n_carts
			});

			$toastMessageSuccess = `Congregation: ${congregation_name} successfully added`;
			$toastSuccess = true;
			setTimeout(() => {
				$toastSuccess = false;
			}, 8000);
		} catch (error) {
			$toastMessageAlert = `Failed to add ${congregation_name}: ${error}`;
			$toastAlert = true;
			setTimeout(() => {
				$toastAlert = false;
			}, 8000);
		}
	}

	function importDataBtn() {
		const inputFile = document.getElementById('import');
		inputFile?.click();
	}

	async function importData() {
		await importInto(db, files[0], { clearTablesBeforeImport: true, overwriteValues: true }).then(
			() => {
				$toastMessageSuccess = 'Congregation imported successfully';
				$toastSuccess = true;
			}
		);

		setTimeout(() => {
			$toastSuccess = false;
		}, 8000);
	}
</script>

<main>
	<section class="bg-gray-50 dark:bg-gray-900">
		<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
			<a
				href="/"
				class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
			>
				<img
					class="w-8 h-8 mr-2"
					src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
					alt="logo"
				/>
				PPOC Gen
			</a>
			<div
				class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700"
			>
				<div class="p-6 space-y-4 md:space-y-6 sm:p-8">
					<h1
						class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
					>
						Create a New Congregation
					</h1>
					<form class="space-y-4 md:space-y-6" action="#">
						<div>
							<label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
								>Congregation name</label
							>
							<input
								type="text"
								name="name"
								id="name"
								class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
								placeholder="Warwick"
								required
								bind:value={congregation_name}
							/>
						</div>
						<div>
							<label
								for="n_carts"
								class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
								>Number of Carts</label
							>
							<input
								type="number"
								name="n_carts"
								id="n_carts"
								class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
								required
								min="1"
								max="99"
								bind:value={n_carts}
							/>
						</div>
						<Button
							class="w-full"
							on:click={createCongregation}>Create Congregation</Button
						>
						<p class="text-center">- Or -</p>
						<input
							bind:files
							id="import"
							name="import"
							type="file"
							class="hidden"
							on:change={importData}
						/>
						<Button class="w-full" on:click={importDataBtn}>
							<CloudArrowUpSolid class="w-6 h-6 me-3" />
							Import Data
						</Button>
						<p class="text-sm font-light text-gray-500 dark:text-gray-400">
							Read the official <a
								href="/documentation"
								class="font-medium text-primary-600 hover:underline dark:text-primary-500"
								>Documentation</a
							>
						</p>
					</form>
				</div>
			</div>
		</div>
	</section>
</main>
