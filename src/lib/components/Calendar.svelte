<script lang="ts">
	import Calendar from '@event-calendar/core'
	import TimeGrid from '@event-calendar/time-grid'
	import List from '@event-calendar/list'
	import DayGrid from '@event-calendar/day-grid'
	import {db} from '$lib/db'
	import {locale, _} from 'svelte-i18n'
	import {onMount} from 'svelte'
	import {Badge, Button, ButtonGroup} from 'flowbite-svelte'
	import {fetchWeatherApi} from 'openmeteo'
	import {nameOrder, weekOrder} from '$lib/stores'

	//Doesn't support typescript yet
	// eslint-disable-next-line
	var cal: any
	let mobile = false,
		date = new Date(),
		shownDate: string = '',
		week_order = 1,
		viewMode = 'listWeek'
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
		//Media Queries for Calendar View
		const mediaQuery = window.matchMedia('(width <= 860px)')
		mediaQuery.addEventListener('change', ({matches}) => {
			if (matches) {
				mobile = true
				cal?.setOption('view', 'listWeek')
				viewMode = 'listWeek'
			} else {
				mobile = false
				cal?.setOption('view', 'dayGridMonth')
				viewMode = 'dayGridMonth'
			}
		})
		if (mediaQuery.matches) {
			mobile = true
			cal?.setOption('view', 'listWeek')
			viewMode = 'listWeek'
		} else {
			mobile = false
			cal?.setOption('view', 'dayGridMonth')
			viewMode = 'dayGridMonth'
		}

		let weatherData
		let cong = await db.congregation.orderBy('id').first()
		if (cong?.lat && cong?.lon) {
			//Weather for Calendar forecast
			const params = {
				latitude: cong.lat,
				longitude: cong.lon,
				daily: ['weather_code'],
				timezone: 'auto',
				forecast_days: 14
			}
			try {
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
			} catch (error) {
				console.log('Error at retrieving the weather')
				console.log(error)
			}
		}

		//Calendar
		let events = [],
			eventUsers = [],
			plugins = [TimeGrid, List, DayGrid],
			backgroundColors = ['#ffee93', '#92dce5', '#ecbad3', '#f0e6ef', '#b8bedd'],
			index = 0,
			weather = ''

		const turns = await db.turn.toArray()
		for (let turn of turns) {
			const assiggnments = await db.assignment.where({turn_id: turn.id}).toArray()
			for (let assiggnment of assiggnments) {
				const users = await db.user.where('id').equals(assiggnment.user_id).toArray()
				for (let user of users) {
					if ($nameOrder == 'firstname') {
						eventUsers.push(`<li class="ml-1">${user.firstname} ${user.lastname}</li>`)
					}
					if ($nameOrder == 'lastname') {
						eventUsers.push(`<li class="ml-1">${user.lastname} ${user.firstname}</li>`)
					}
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

		if ($weekOrder == 'monday') {
			week_order = 1
		}
		if ($weekOrder == 'sunday') {
			week_order = 0
		}

		let options = {
			view: viewMode,
			locale: $locale,
			buttonText: {today: $_('turns.today'), next: 'Next', prev: 'Previous'},
			firstDay: week_order,
			date: date,
			height: '100%',
			events: events,
			eventClassNames: 'm-0.5',
			eventTextColor: 'black',
			editable: false,
			eventDurationEditable: false,
			eventStartEditable: false,
			noEventsContent: $_('turns.no-turns'),
			datesSet: info => {
				let startMonth = $_('general.' + info.start.toLocaleString('en', {month: 'long'}).toLowerCase()),
					endMonth = $_('general.' + info.end.toLocaleString('en', {month: 'long'}).toLowerCase()),
					startYear = info.start.getFullYear(),
					endYear = info.end.getFullYear(),
					day = ''

				if (startMonth == endMonth || info.view.type == 'listDay') {
					if (info.view.type == 'listDay') {
						day = info.start.getDate()
						shownDate = day + ' ' + startMonth + ' ' + startYear
					} else {
						shownDate = startMonth
					}
				} else {
					if (startYear == endYear) {
						shownDate = startMonth + ' - ' + endMonth
					} else {
						shownDate = startMonth + ' ' + startYear + ' - ' + endMonth + ' ' + endYear
					}
				}

				if (info.view.type == 'dayGridMonth') {
					shownDate = ''
				}
			},
			dayHeaderFormat: (day: Date) => {
				return $_(
					'general.' + ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][day.getDay()]
				)
			},
			listDayFormat: (day: Date) => {
				return $_(
					'general.' + ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][day.getDay()]
				)
			},
			listDaySideFormat: {day: 'numeric'},
			views: {
				dayGridMonth: {
					titleFormat: (day: Date) => {
						return $_('general.' + day.toLocaleString('en', {month: 'long'}).toLowerCase()) + ' ' + day.getFullYear()
					}
				},
				listWeek: {
					titleFormat: () => {
						return ''
					},
					headerToolbar: {start: '', center: 'prev,today,next', end: ''}
				},
				listDay: {
					titleFormat: () => {
						return ''
					},
					headerToolbar: {start: '', center: 'prev,today,next', end: ''}
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
	})
</script>

<div class="m-3 print:hidden">
	<ButtonGroup>
		<Button outline color="dark" on:click={cal?.setOption('view', 'listDay')}>{$_('home.day-view')}</Button>
		<Button outline color="dark" on:click={cal?.setOption('view', 'listWeek')}>{$_('home.week-view')}</Button>
		{#if !mobile}
			<Button outline color="dark" on:click={cal?.setOption('view', 'dayGridMonth')}>{$_('home.month-view')}</Button>
		{/if}
	</ButtonGroup>
</div>

{#if cal && shownDate != ''}
	<Badge border color="red" class="my-2 w-full text-xl print:hidden">
		{shownDate}
	</Badge>
{/if}
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

	:global(.dark .ec-button):hover {
		background-color: rgb(75 85 99 / var(--tw-bg-opacity));
	}
</style>
