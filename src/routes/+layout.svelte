<script lang="ts">
	import '../app.css'
	import {liveQuery} from 'dexie'
	import {db} from '$lib/db'
	import NavBar from '$lib/components/NavBar.svelte'
	import New from '$lib/components/New.svelte'
	import {Toast} from 'flowbite-svelte'
	import {slide} from 'svelte/transition'
	import {CheckCircleSolid, ExclamationCircleSolid, FireOutline, CloseCircleSolid} from 'flowbite-svelte-icons'
	import {
		toastMessageAlert,
		toastMessageWarning,
		toastMessageSuccess,
		toastSuccess,
		toastWarning,
		toastAlert
	} from '$lib/store'
	import {registerSW} from 'virtual:pwa-register'
	import {pwaInfo} from 'virtual:pwa-info'

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : ''

	//TODO: Add Callbacks when app is offline or need refresh following https://vite-pwa-org.netlify.app/guide/prompt-for-update.html
	const intervalMS: number = 60 * 60 * 1000
	registerSW({
		immediate: true,
		onOfflineReady() {},
		onNeedRefresh() {},
		onRegistered(r) {
			r &&
				setInterval(() => {
					r.update()
				}, intervalMS)
		}
	})
	let congregation = liveQuery(() => db.congregation.toArray())

	//TODO: Create function to add new Toasts instead of modifying and showing only one. This will allow them to stack instead of just override
</script>

<svelte:head>
	{@html webManifestLink}
</svelte:head>

<main>
	{#if $congregation}
		{#if !$congregation[0]}
			<New />
		{:else}
			<NavBar />
			{#if $toastSuccess}
				<Toast color="green" id="toast-success" position="bottom-right" transition={slide}>
					<svelte:fragment slot="icon">
						<CheckCircleSolid class="h-5 w-5" />
						<span class="sr-only">Check icon</span>
					</svelte:fragment>
					{$toastMessageSuccess}
				</Toast>
			{/if}
			{#if $toastAlert}
				<Toast color="red" id="toast-error" position="bottom-right" transition={slide}>
					<svelte:fragment slot="icon">
						<CloseCircleSolid class="h-5 w-5" />
						<span class="sr-only">Error icon</span>
					</svelte:fragment>
					{$toastMessageAlert}
				</Toast>
			{/if}
			{#if $toastWarning}
				<Toast color="orange" id="toast-warning" position="bottom-right" transition={slide}>
					<svelte:fragment slot="icon">
						<ExclamationCircleSolid class="h-5 w-5" />
						<span class="sr-only">Warning icon</span>
					</svelte:fragment>
					{$toastMessageWarning}
				</Toast>
			{/if}
			<slot />
		{/if}
	{/if}
</main>
