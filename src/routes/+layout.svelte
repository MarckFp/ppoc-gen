<script lang="ts">
    import "../app.css";
    import { liveQuery } from "dexie";
    import { db } from "$lib/db";
    import New from "$lib/components/New.svelte";

    let congregation = liveQuery(
        () => db.congregation.toArray()
    );
</script>

<body>
    {#if $congregation}
        {#if !$congregation[0]}
            <New />
        {:else}
            <slot />
        {/if}
    {/if}
</body>
