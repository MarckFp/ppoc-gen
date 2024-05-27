<script lang="ts">
	import {Toast, Button} from 'flowbite-svelte'
	import {slide} from 'svelte/transition'
	import {useRegisterSW} from 'virtual:pwa-register/svelte'
	import {_} from 'svelte-i18n'
	const {needRefresh, updateServiceWorker, offlineReady} = useRegisterSW({
		onRegistered(r) {
			r &&
				setInterval(() => {
					r.update()
				}, 10000 /* 10s */)
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
	<Toast class="m-3" transition={slide} dismissable={false}>
		<span class="font-semibold text-gray-900 dark:text-white">
			{#if $offlineReady}
				{$_('general.app-offline')}
			{:else}
				{$_('general.new-version')}
			{/if}
		</span>
		<div class="mt-3">
			<div class="grid {$needRefresh ? 'grid-cols-2 gap-2' : 'grid-cols-1'}">
				{#if $needRefresh}
					<Button size="xs" on:click={() => updateServiceWorker(true)} class="w-full">{$_('general.update-btn')}</Button
					>
				{/if}
				<Button size="xs" class="w-full" color="dark" on:click={close}>{$_('general.close-btn')}</Button>
			</div>
		</div>
	</Toast>
{/if}
