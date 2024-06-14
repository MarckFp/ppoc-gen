<script lang="ts">
	import '../app.css'
	import {mobile, weekOrder, nameOrder} from '$lib/stores'
	import {page} from '$app/stores'

	//Media Queries for Calendar View
	const mediaQuery = window.matchMedia('(width <= 640px)')
	mediaQuery.addEventListener('change', ({matches}) => {
		if (matches) {
			mobile.set(true)
		} else {
			mobile.set(false)
		}
	})
	if (mediaQuery.matches) {
		mobile.set(true)
	} else {
		mobile.set(false)
	}

	if ($page.data.congregation != undefined) {
		weekOrder.set($page.data.congregation.week_order)
		nameOrder.set($page.data.congregation.name_order)
	}
</script>

<svelte:head>
	<link rel="canonical" href="https://ppocgen.com{window.location.pathname}" />
</svelte:head>

<slot />
