<script lang="ts">
	import '../app.css'
	import {db} from '$lib/db'
	import {mobile, weekOrder, nameOrder} from '$lib/stores'

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

	db.congregation
		.orderBy('id')
		.first()
		.then(congregation => {
			weekOrder.set(congregation?.week_order)
			nameOrder.set(congregation?.name_order)
		})
</script>

<svelte:head>
	<link rel="canonical" href="https://ppocgen.com{window.location.pathname}" />
</svelte:head>

<slot />
