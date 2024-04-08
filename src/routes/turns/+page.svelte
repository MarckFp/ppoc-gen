<script lang="ts">
	import { Card, Button, Label, Input } from 'flowbite-svelte';
    import { db } from '$lib/db';
	import { liveQuery } from 'dexie';

    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 2).toISOString().split('T')[0];
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().split('T')[0];

    let turns = liveQuery(() => db.turn.where('date').between(firstDay, lastDay).toArray());

</script>

<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto">
	<Card size="xl" class="mb-2">
        <div class="mt-1 mb-4 flex flex-row justify-around">
            <Label>
                From:
                <Input type="date" />
            </Label>
            <Label>
                To:
                <Input type="date" />
            </Label>
		    <Button color="blue" class="w-8/12">Create Turns</Button>
        </div>
	</Card>
    {#if $turns}
        <Card size="xl" class="mt-2">
            {#if $turns.length == 0}
                <p class="text-center">No turns yet created</p>
            {:else}
                <p class="text-center">There are turns created</p>
            {/if}
        </Card>
    {/if}
</div>
