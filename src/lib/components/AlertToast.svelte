<script lang="ts">
	import {Toast} from 'flowbite-svelte'
	import {slide} from 'svelte/transition'
	import {CheckCircleSolid, ExclamationCircleSolid, CloseCircleSolid} from 'flowbite-svelte-icons'

	export let alertStatus: string
	export let alertMessage: string
	export let fadeDelay: number = 5000
	let color: string = 'green',
		alertVisible: boolean = true,
		mobile: boolean = false
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

{#if alertVisible}
	<Toast {color} class="m-2 print:hidden {mobile ? 'mb-20' : ''}" transition={slide}>
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
