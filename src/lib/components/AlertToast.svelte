<script lang="ts">
	import {Toast} from 'flowbite-svelte'
	import {slide} from 'svelte/transition'
	import {CheckCircleSolid, ExclamationCircleSolid, CloseCircleSolid} from 'flowbite-svelte-icons'

	export let alertStatus: string
	export let alertMessage: string
	export let fadeDelay: number = 5000
	let color: string = 'green'
	let alertVisible: boolean = true
	setTimeout(() => {
		alertVisible = false
	}, fadeDelay)
	if (alertStatus.toLowerCase() == 'success' || alertStatus.toLowerCase() == 'ok') {
		color = 'green'
	} else if (alertStatus.toLowerCase() == 'warning' || alertStatus.toLowerCase() == 'warn') {
		color = 'yellow'
	} else if (alertStatus.toLowerCase() == 'error' || alertStatus.toLowerCase() == 'err') {
		color = 'red'
	}
</script>

{#if alertVisible}
	<Toast {color} class="m-3" transition={slide}>
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
