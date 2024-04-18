<script lang="ts">
	import {Toast, Button} from 'flowbite-svelte'
	import {slide} from 'svelte/transition'
	import {useRegisterSW} from 'virtual:pwa-register/svelte'
	const {needRefresh, updateServiceWorker, offlineReady} = useRegisterSW({
		onRegistered(r) {
			r &&
				setInterval(() => {
					r.update()
				}, 10000 /* 10s for testing purposes */)
		},
		onRegisterError(error) {
			console.log('SW registration error', error)
		}
	})
	const close = () => {
		offlineReady.set(false)
		needRefresh.set(false)
	}
	$: toast = $offlineReady || $needRefresh
</script>

{#if toast}
	<Toast class="m-3" transition={slide}>
		<span class="font-semibold text-gray-900 dark:text-white">
			{#if $offlineReady}
				App ready to work offline
			{:else}
				New content available, click on reload button to update.
			{/if}
		</span>
		<div class="mt-3">
			<div class="mb-2 text-sm font-normal">A new software version is available for download.</div>
			<div class="grid grid-cols-2 gap-2">
				{#if $needRefresh}
					<Button size="xs" on:click={() => updateServiceWorker(true)} class="w-full">Update</Button>
				{/if}
			<Button size="xs" class="w-full" color="dark">Close</Button>
			</div>
		</div>
	</Toast>
{/if}
