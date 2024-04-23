<script lang="ts">
	import Calendar from '@event-calendar/core'
	import TimeGrid from '@event-calendar/time-grid'
	import List from '@event-calendar/list'
	import DayGrid from '@event-calendar/day-grid'
	import {db} from '$lib/db'
	import {locale, _} from 'svelte-i18n'
	import {onMount} from 'svelte'
	import {Button, ButtonGroup} from 'flowbite-svelte'
	import Device from 'svelte-device-info'

	//Doesn't support typescript yet
	var cal: any
	let disabledMobile = false
	let defaultView = 'dayGridMonth'
	if (Device.isPhone) {
		disabledMobile = true
		defaultView = 'listWeek'
	}
	onMount(async () => {
		let events = []
		let eventUsers = []
		let plugins = [TimeGrid, List, DayGrid]
		let backgroundColors = ['#ffee93', '#92dce5', '#ecbad3', '#f0e6ef', '#b8bedd']
		let index = 0
		const turns = await db.turn.toArray()
		for (let turn of turns) {
			const assiggnments = await db.assignment.where({turn_id: turn.id}).toArray()
			for (let assiggnment of assiggnments) {
				const users = await db.user.where('id').equals(assiggnment.user_id).toArray()
				for (let user of users) {
					eventUsers.push('<p>- ' + user.firstname + ' ' + user.lastname + '</p>')
				}
			}
			events.push({
				id: turn.id,
				start: new Date(turn.date + ' ' + turn.start_time + ':00'),
				end: new Date(turn.date + ' ' + turn.end_time + ':00'),
				title: {html: `<strong>${turn.location}</strong>${eventUsers.join('')}`},
				backgroundColor: backgroundColors[index],
				textColor: 'black'
			})
			index++
			if (index >= 4) {
				index = 0
			}
			eventUsers = []
		}

		let date = new Date()

		let options = {
			view: 'dayGridMonth',
			locale: $locale,
			dayHeaderFormat: {weekday: 'long'},
			buttonText: {today: $_('turns.today')},
			firstDay: 1,
			date: date,
			height: '100%',
			events: events,
			eventClassNames: 'm-0.5'
		}
		cal = new Calendar({
			target: document.querySelector('#calendar-container'),
			props: {
				plugins: plugins,
				options: options
			}
		})
	})
</script>

<div class="m-3">
	<ButtonGroup>
		<Button outline color="dark" on:click={cal?.setOption('view', 'listDay')}>{$_('home.day-view')}</Button>
		<Button outline color="dark" on:click={cal?.setOption('view', 'listWeek')}>{$_('home.week-view')}</Button>
		<Button outline color="dark" disabled={disabledMobile} on:click={cal?.setOption('view', 'dayGridMonth')}
			>{$_('home.month-view')}</Button
		>
	</ButtonGroup>
</div>
<div
	id="calendar-container"
	class="mb-4 w-full items-center divide-gray-200 rounded-lg border border-gray-200 bg-white p-5 text-gray-900 shadow-md dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
></div>
