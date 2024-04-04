<script lang="ts">
    import { db } from "$lib/db";

    let congregation_name: string, n_carts: number = 1, status: string;

    async function createCongregation(){
        try {
            const id = await db.congregation.add({
                name: congregation_name,
                n_carts: n_carts
            });

            status = `Congregation: ${congregation_name} successfully added. Got id ${id}`;

            congregation_name = "";
            n_carts = 1;
        } catch (error) {
            status = `Failed to add ${congregation_name}: ${error}`;
        }
    }
</script>

<main>
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <img class="mx-auto h-10 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company">
        <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Create your Congregation</h2>
        </div>
    
        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" action="#" method="POST">
            <div>
            <label for="name" class="block text-sm font-medium leading-6 text-gray-900">Congregation Name</label>
            <div class="mt-2">
                <input bind:value={congregation_name} id="name" name="name" type="text" placeholder="Warwick" required class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            </div>
            </div>
    
            <div>
            <div class="flex items-center justify-between">
                <label for="n_carts" class="block text-sm font-medium leading-6 text-gray-900">Number of Carts</label>
            </div>
            <div class="mt-2">
                <input bind:value={n_carts} id="n_carts" name="n_carts" type="number" min="1" max="99" required class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            </div>
            </div>
    
            <div>
                <button on:click={createCongregation} class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Create Congregation</button>
            </div>
        </form>
        </div>
    </div>
</main>

<style lang="postcss">
</style>