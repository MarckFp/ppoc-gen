<script lang="ts">
	import {base} from '$app/paths'
	import {DarkMode} from 'flowbite-svelte'
	import {_} from 'svelte-i18n'
	import {page} from '$app/stores'
</script>

<DarkMode class="hidden" />

<section class="flex h-screen items-center bg-white dark:bg-gray-700">
	<div class="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
		<div class="mx-auto max-w-screen-sm text-center">
			<h1 class="mb-4 text-7xl font-extrabold tracking-tight text-primary-600 dark:text-primary-500 lg:text-9xl">
				{$page.status}
			</h1>
			<p class="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">{$_('errors.404')}</p>
			<p class="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">{$_('errors.404-msg')}</p>
			<a
				href="{base}/"
				class="my-4 inline-flex rounded-lg bg-primary-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900"
				>{$_('errors.404-btn')}</a
			>
		</div>
	</div>
</section>
