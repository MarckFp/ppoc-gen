<script lang="ts">
	import {Toast} from 'flowbite-svelte'
	import {slide} from 'svelte/transition'
	import {CheckCircleSolid, ExclamationCircleSolid, CloseCircleSolid} from 'flowbite-svelte-icons'

	export let alertStatus: string
	export let alertMessage: string
	let alertVisible: boolean = true
	setTimeout(() => {
		alertVisible = false
	}, 5000)
</script>

{#if alertVisible}
	<Toast color="green" class="m-2" transition={slide}>
		<svelte:fragment slot="icon">
			{#if alertStatus.toLowerCase() == 'success' || alertStatus.toLowerCase() == 'ok'}
				<CheckCircleSolid class="h-5 w-5" />
			{:else if alertStatus.toLowerCase() == 'warning' || alertStatus.toLowerCase() == 'warn'}
				<ExclamationCircleSolid class="h-5 w-5" />
			{:else if alertStatus.toLowerCase() == 'error' || alertStatus.toLowerCase() == 'err'}
				<CloseCircleSolid class="h-5 w-5" />
			{/if}
			<span class="sr-only">Check icon</span>
		</svelte:fragment>
		{alertMessage}
	</Toast>
{/if}
