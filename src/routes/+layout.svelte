<script lang="ts">
	import '../app.css';
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import NavBar from '$lib/components/NavBar.svelte';
	import New from '$lib/components/New.svelte';
	import { Toast } from 'flowbite-svelte';
	import {
		CheckCircleSolid,
		ExclamationCircleSolid,
		FireOutline,
		CloseCircleSolid
	} from 'flowbite-svelte-icons';

    let success: boolean, error: boolean, warning: boolean;
	let congregation = liveQuery(() => db.congregation.toArray());

</script>

<body>
	{#if $congregation}
		{#if !$congregation[0]}
			<New />
		{:else}
			<NavBar />
			{#if success}
				<Toast color="green" id="toast-success" position="bottom-right">
					<svelte:fragment slot="icon">
						<CheckCircleSolid class="w-5 h-5" />
						<span class="sr-only">Check icon</span>
					</svelte:fragment>
					Item moved successfully.
				</Toast>
			{/if}
			{#if error}
				<Toast color="red" id="toast-error" position="bottom-right">
					<svelte:fragment slot="icon">
						<CloseCircleSolid class="w-5 h-5" />
						<span class="sr-only">Error icon</span>
					</svelte:fragment>
					Item has been deleted.
				</Toast>
			{/if}
			{#if warning}
				<Toast color="orange" id="toast-warning" position="bottom-right">
					<svelte:fragment slot="icon">
						<ExclamationCircleSolid class="w-5 h-5" />
						<span class="sr-only">Warning icon</span>
					</svelte:fragment>
					Improve password difficulty.
				</Toast>
			{/if}
			<slot />
		{/if}
	{/if}
</body>
