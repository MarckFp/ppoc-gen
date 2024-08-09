<script lang="ts">
	import {Card, Dropdown, DropdownDivider, DropdownItem, GradientButton, Helper, Toast} from 'flowbite-svelte'
	import {
		GithubSolid,
		BookSolid,
		ExclamationCircleSolid,
		ChevronDownOutline,
		WindowsSolid,
		AppleSolid,
		DesktopPcSolid,
		MobilePhoneSolid
	} from 'flowbite-svelte-icons'
	import {_} from 'svelte-i18n'
	import Calendar from '$lib/components/Calendar.svelte'
	import {page} from '$app/stores'

	const announcement = ``

	// eslint-disable-next-line
	const version = PKG.version ?? 'unknown'
</script>

<svelte:head>
	<title>PPOC Gen</title>
</svelte:head>

<section class="flex flex-col items-center p-4">
	{#if $page.data.congregation != undefined}
		<Card class="text-center" size="xl" padding="xl">
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white">
				{$_('home.welcome')}
				{$page.data.congregation.name}
			</h1>
		</Card>
	{/if}

	{#if announcement != ''}
		<Toast color="orange" class="my-2 w-full max-w-screen-xl text-gray-900 dark:text-white">
			<svelte:fragment slot="icon">
				<ExclamationCircleSolid class="h-5 w-5" />
				<span class="sr-only">Warning icon</span>
			</svelte:fragment>
			<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{$_('home.announcement')}:</h5>
			<p>{announcement}</p>
		</Toast>
	{/if}

	<Card size="xl" padding="sm" class="dark:ec-auto-dark my-4 flex flex-col items-center">
		<Calendar />
	</Card>

	<Card size="xl" class="py-2">
		<div class="grid gap-2 px-2 text-gray-900 dark:text-white md:grid-cols-2">
			<GradientButton color="teal" href="https://github.com/MarckFp/ppoc-gen/blob/main/docs/README.md"
				>{$_('home.docs')} <BookSolid class="ms-1" /></GradientButton
			>
			<GradientButton
				color="cyanToBlue"
				disabled={version != 'unknown' && !version.includes('beta') ? 'false' : 'true'}
			>
				{$_('home.download-btn')}
				<GithubSolid class="ms-1" />
				<ChevronDownOutline class="ms-2 h-6 w-6 text-white dark:text-white" />
			</GradientButton>
			<Dropdown>
				<DropdownItem
					href="https://github.com/MarckFp/ppoc-gen/releases/download/{version}/PPOC.Gen_{version}_x64-setup.exe"
				>
					<div class="flex flex-row gap-1"><span>Windows</span><WindowsSolid /></div>
				</DropdownItem>
				<DropdownDivider />
				<DropdownItem href="https://github.com/MarckFp/ppoc-gen/releases/download/{version}/PPOC.Gen_{version}_x64.dmg">
					<div class="flex flex-row gap-1"><span>MacOS</span><AppleSolid /></div>
					<Helper>Intel</Helper>
				</DropdownItem>
				<DropdownItem
					href="https://github.com/MarckFp/ppoc-gen/releases/download/{version}/PPOC.Gen_{version}_aarch64.dmg"
				>
					<div class="flex flex-row gap-1"><span>MacOS</span><AppleSolid /></div>
					<Helper>arm</Helper>
				</DropdownItem>
				<DropdownDivider />
				<DropdownItem
					href="https://github.com/MarckFp/ppoc-gen/releases/download/{version}/ppoc-gen_{version}_amd64.deb"
				>
					<div class="flex flex-row gap-1"><span>Linux</span><DesktopPcSolid /></div>
				</DropdownItem>
				<DropdownDivider />
				<DropdownItem href="https://github.com/MarckFp/ppoc-gen/releases/download/{version}/app-release-signed.apk">
					<div class="flex flex-row gap-1"><span>Android</span><MobilePhoneSolid /></div>
				</DropdownItem>
			</Dropdown>
		</div>
	</Card>
</section>
