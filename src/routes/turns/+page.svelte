<script lang="ts">
	import { Card, Button, Label, Input, Spinner } from 'flowbite-svelte';
    import { toastMessageSuccess, toastSuccess, toastMessageAlert, toastAlert, toastMessageWarning, toastWarning } from '$lib/store';
    import { db } from '$lib/db';
	import { liveQuery } from 'dexie';
    import { _ } from 'svelte-i18n';

    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 2).toISOString().split('T')[0];
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().split('T')[0];
    let turns = liveQuery(() => db.turn.where('date').between(firstDay, lastDay).toArray());
    let schedules = liveQuery(() => db.schedule.toArray());

    let fromDate: string, toDate:string;
    let loading = false;

    async function createTurns() {
        loading = true;
        let from = new Date(fromDate);
        let to = new Date(toDate);

        if (from > to) {
            fromDate = '';
            toDate = '';
            loading = false;

            $toastMessageAlert = `From Date cannot be bigger than To Date`;
			$toastAlert = true;
			setTimeout(() => {
				$toastAlert = false;
			}, 8000);
            return;
        }

        let weekday: string, userList, users, incidences;

        for (var d = from; d <= to; d.setDate(d.getDate() + 1)) {
            weekday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][d.getDay()]
            //Loop over schedules
            $schedules.forEach(async (schedule) => {
                if (schedule.weekday === weekday) {
                    userList = await db.availability.where({schedule_id: schedule.id}).toArray();
                    if (userList.length == 0) {
                        $toastMessageWarning = `There is no publishers with availability on ${weekday}`;
                        $toastWarning = true;
                        setTimeout(() => {
                            $toastWarning = false;
                        }, 8000);
                    }
                    //Loop over availabilities
                    userList.forEach(async (availabilities) => {
                        users = await db.user.where({id: availabilities.user_id}).toArray();
                        if (users.length == 0) {
                            $toastMessageWarning = `There is no publishers that can be assigned on ${d.toISOString().split('T')[0]}`;
                            $toastWarning = true;
                            setTimeout(() => {
                                $toastWarning = false;
                            }, 8000);
                        }
                        //Loop over users
                        users.forEach(async (user) => {
                            incidences = await db.incidence.where({user_id: user.id}).toArray();
                            //Loop over incidences
                            incidences.forEach(async (incidence) => {
                                if (incidence.start_date >= d.toISOString().split('T')[0] && d.toISOString().split('T')[0] <= incidence.end_date) {
                                    return;
                                }
                            });
                        });
                    });
                }
            });
        }

        fromDate = '';
        toDate = '';
        loading = false;
    }
</script>

<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto">
	<Card size="xl" class="mb-2">
        <div class="mt-1 mb-4 flex flex-row justify-around">
            <Label class="w-3/12 mr-2">
                {$_('turns.from')}:
                <Input type="date" bind:value={fromDate}/>
            </Label>
            <Label class="w-3/12 mr-2 ml-2">
                {$_('turns.to')}:
                <Input type="date" bind:value={toDate}/>
            </Label>
		    <Button color="blue" class="w-6/12 ml-2" on:click={createTurns}>
                {#if loading}
                    <Spinner class="me-3" size="4" color="white" />
                    {$_('turns.creating')}
                {:else}
                    {$_('turns.create-btn')}
                {/if}
            </Button>
        </div>
	</Card>
    {#if $turns}
        <Card size="xl" class="mt-2">
            {#if $turns.length == 0}
                <p class="text-center">{$_('turns.no-turns')}</p>
            {:else}
                <p class="text-center">There are turns created</p>
            {/if}
        </Card>
    {/if}
</div>
