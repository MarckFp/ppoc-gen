<script lang="ts">
	import Calendar from '@event-calendar/core'
	import TimeGrid from '@event-calendar/time-grid'
	import List from '@event-calendar/list'
	import DayGrid from '@event-calendar/day-grid'
	import {db} from '$lib/db'
	import {locale, _} from 'svelte-i18n'
	import {onMount} from 'svelte'
	import {Button, ButtonGroup} from 'flowbite-svelte'
	import {fetchWeatherApi} from 'openmeteo'

	//Doesn't support typescript yet
	var cal: any
	let disabledMobile = false
	const WMO = {
		0: 'clear_sky',
		1: 'mainly_clear',
		2: 'partially_cloud',
		3: 'cloudy',
		45: 'fog',
		48: 'fog',
		51: 'light_drizzle',
		53: 'moderate_drizzle',
		55: 'dense_drizzle',
		56: 'light_freezing_drizzle',
		57: 'dense_freezing_drizzle',
		61: 'light_rain',
		63: 'moderate_rain',
		65: 'heavy_rain',
		66: 'light_freezing_rain',
		67: 'heavy_freezing_rain',
		71: 'slight_snow',
		73: 'moderate_snow',
		75: 'heavy_snow',
		77: 'snow_grains',
		80: 'slight_rain_shower',
		81: 'moderate_rain_shower',
		82: 'heavy_rain_shower',
		85: 'slight_snow_shower',
		86: 'heavy_snow_shower',
		95: 'thunderstorm',
		96: 'thunderstorm_slight_hail',
		99: 'thunderstorm_heavy_hail'
	}

	onMount(async () => {
		let weatherData
		//TODO: Add this to the congregation Settings so we could use always the cong ubication and prevent using the user location
		let cong = await db.congregation.toArray()
		if (cong[0].lat && cong[0].lon) {
			//Weather for Calendar forecast
			const params = {
				latitude: cong[0].lat,
				longitude: cong[0].lon,
				daily: ['weather_code'],
				timezone: 'auto',
				forecast_days: 14
			}
			const url = 'https://api.open-meteo.com/v1/forecast'
			const responses = await fetchWeatherApi(url, params)

			const range = (start: number, stop: number, step: number) =>
				Array.from({length: (stop - start) / step}, (_, i) => start + i * step)

			const response = responses[0]
			const utcOffsetSeconds = response.utcOffsetSeconds()
			const daily = response.daily()!

			weatherData = {
				daily: {
					time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
						t => new Date((t + utcOffsetSeconds) * 1000)
					),
					weatherCode: daily.variables(0)!.valuesArray()!
				}
			}
		}

		//Calendar
		let events = []
		let eventUsers = []
		let plugins = [TimeGrid, List, DayGrid]
		let backgroundColors = ['#ffee93', '#92dce5', '#ecbad3', '#f0e6ef', '#b8bedd']
		let index = 0
		let weather = ''
		const turns = await db.turn.toArray()
		for (let turn of turns) {
			const assiggnments = await db.assignment.where({turn_id: turn.id}).toArray()
			for (let assiggnment of assiggnments) {
				const users = await db.user.where('id').equals(assiggnment.user_id).toArray()
				for (let user of users) {
					eventUsers.push(`<li class="ml-1">${user.firstname} ${user.lastname}</li>`)
				}
			}
			if (weatherData != undefined) {
				for (let i = 0; i < weatherData.daily.time.length; i++) {
					if (new Date(turn.date).toISOString() == weatherData.daily.time[i].toISOString()) {
						weather = $_('home.' + WMO[weatherData.daily.weatherCode[i]])
					}
				}
			}
			events.push({
				id: turn.id,
				start: new Date(turn.date + ' ' + turn.start_time + ':00'),
				end: new Date(turn.date + ' ' + turn.end_time + ':00'),
				title: {
					html: `<strong>${turn.location}</strong> <small>${weather}</small>${eventUsers.join('')}`
				},
				backgroundColor: backgroundColors[index]
			})
			index++
			if (index >= 4) {
				index = 0
			}
			eventUsers = []
			weather = ''
		}

		let date = new Date()
		let week_order = 1

		if (cong[0] && cong[0].week_order) {
			if (cong[0].week_order == 'monday') {
				week_order = 1
			}
			if (cong[0].week_order == 'sunday') {
				week_order = 0
			}
		}

		let options = {
			view: 'dayGridMonth',
			locale: $locale,
			dayHeaderFormat: {weekday: 'long'},
			buttonText: {today: $_('turns.today')},
			firstDay: week_order,
			date: date,
			height: '100%',
			events: events,
			eventClassNames: 'm-0.5',
			eventTextColor: 'black',
			noEventsContent: $_('turns.no-turns'),
			dayHeaderFormat: day => {
				return $_(
					'general.' + ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][day.getDay()]
				)
			},
			listDayFormat: day => {
				return $_(
					'general.' + ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][day.getDay()]
				)
			},
			views: {
				dayGridMonth: {
					titleFormat: day => {
						return (
							$_('general.' + day.toLocaleString('default', {month: 'long'}).toLowerCase()) + ' ' + day.getFullYear()
						)
					}
				}
			}
		}
		cal = new Calendar({
			target: document.querySelector('#calendar-container'),
			props: {
				plugins: plugins,
				options: options
			}
		})

		//Media Queries for Calendar View
		const mediaQuery = window.matchMedia('(width <= 860px)')
		mediaQuery.addEventListener('change', ({matches}) => {
			if (matches) {
				disabledMobile = true
				cal?.setOption('view', 'listWeek')
			} else {
				disabledMobile = false
				cal?.setOption('view', 'dayGridMonth')
			}
		})
		if (mediaQuery.matches) {
			disabledMobile = true
			cal?.setOption('view', 'listWeek')
		} else {
			disabledMobile = false
			cal?.setOption('view', 'dayGridMonth')
		}
	})
</script>

<div class="m-3">
	<ButtonGroup>
		<Button outline color="dark" on:click={cal?.setOption('view', 'listDay')}>{$_('home.day-view')}</Button>
		<Button outline color="dark" on:click={cal?.setOption('view', 'listWeek')}>{$_('home.week-view')}</Button>
		{#if !disabledMobile}
			<Button outline color="dark" on:click={cal?.setOption('view', 'dayGridMonth')}>{$_('home.month-view')}</Button>
		{/if}
	</ButtonGroup>
</div>
<div
	id="calendar-container"
	class="mb-4 w-full items-center divide-gray-200 rounded-lg border border-gray-200 bg-white p-5 text-gray-900 shadow-md dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
></div>

<style>
	:global(.dark .ec-list .ec-day-head) {
		background-color: #4b5563 !important;
		color: white !important;
	}

	:global(.ec-event-body) {
		flex-direction: column !important;
	}
</style>
