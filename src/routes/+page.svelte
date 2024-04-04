<script lang="ts">
    import { liveQuery } from "dexie";
    import { db } from "$lib/db";
    import NavBar from "$lib/components/NavBar.svelte";

    let congregation = liveQuery(
        () => db.congregation.toArray()
    );
</script>

<NavBar />

<div>
    {#if $congregation}
        <h1>Welcome {$congregation[0].name}</h1>
    {/if}

    <div>
        <button>Publishers</button>
        <button>Settings</button>
        <button>Incidences</button>
        <button>Schedules</button>
        <button>Turns</button>
    </div>
</div>