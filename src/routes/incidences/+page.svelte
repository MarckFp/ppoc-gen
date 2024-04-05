<script lang="ts">
	import { Card, Input, Button } from 'flowbite-svelte';
	import { SearchSolid, ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import Datepicker from '$lib/components/Datepicker.svelte';
</script>

<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto">
	<Card size="xl">
		<div class="flex flex-row justify-between">
			<div class="flex flex-row">
				<Datepicker />
				<Button class="ml-2"><SearchSolid /></Button>
			</div>
			<Button color="blue">Create new Incidence</Button>
		</div>
	</Card>
</div>
