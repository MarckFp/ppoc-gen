<script lang="ts">
	import {Calendar, type EventInput, type EventSourceInput} from '@fullcalendar/core'
	import dayGridPlugin from '@fullcalendar/daygrid'
	import timeGridPlugin from '@fullcalendar/timegrid'
	import listPlugin from '@fullcalendar/list'
	import {db} from '$lib/db'
	import {locale, _} from 'svelte-i18n'
	import {onMount} from 'svelte'
	import {Button, ButtonGroup, Spinner} from 'flowbite-svelte'
	import {fetchWeatherApi} from 'openmeteo'

	//Doesn't support typescript yet
	// eslint-disable-next-line
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
		let date = new Date()
		let week_order = 1
		let events: EventInput[] = []
		let eventUsers = []
		let backgroundColors = ['#ffee93', '#92dce5', '#ecbad3', '#f0e6ef', '#b8bedd']
		let index = 0
		let weather = ''
		const turns = await db.turn.toArray()

		if (cong && cong.week_order) {
			if (cong.week_order == 'monday') {
				week_order = 1
			}
			if (cong.week_order == 'sunday') {
				week_order = 0
			}
		}

		for (let turn of turns) {
			const assiggnments = await db.assignment.where({turn_id: turn.id}).toArray()
			for (let assiggnment of assiggnments) {
				const users = await db.user.where('id').equals(assiggnment.user_id).toArray()
				for (let user of users) {
					if (cong?.name_order == 'firstname') {
						eventUsers.push(`${user.firstname} ${user.lastname}`)
					}
					if (cong?.name_order == 'lastname') {
						eventUsers.push(`${user.lastname} ${user.firstname}`)
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
				title: turn.location,
				extendedProps: {
					users: eventUsers,
					weather: weather
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

		const calDiv = document.getElementById('calendar')
		if (calDiv) {
			cal = new Calendar(calDiv, {
				plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
				initialView: 'dayGridMonth',
				locale: $locale?.toString(),
				initialDate: date,
				events: events,
				buttonText: {
					today: $_('turns.today'),
					month: $_('home.month-view'),
					week: $_('home.week-view'),
					day: $_('home.day-view'),
					list: $_('home.list-view')
				},
				firstDay: week_order,
				fixedWeekCount: false,
				displayEventEnd: true,
				eventContent: function (info) {
					const startTime = info.event.start?.toLocaleTimeString($locale?.toString(), {
						hour: 'numeric',
						minute: '2-digit'
					})
					const endTime = info.event.end?.toLocaleTimeString($locale?.toString(), {hour: 'numeric', minute: '2-digit'})
					let userDiv = ''
					let weatherDiv = ''
					info.event.extendedProps.users.forEach(user => {
						userDiv += `<p class="break-all">- ${user}</p>`
					})
					if (info.event.extendedProps.weather != '') {
						weatherDiv = `<span class="border rounded-full p-1 bg-gray-700">${info.event.extendedProps.weather}</span>`
					}
					let eventContent: string = `
					<div class="flex flex-col rounded-lg p-2 m-1 w-full text-surface shadow-secondary-1 text-black" style="background-color:${info.event.backgroundColor};">
						<div class="flex flex-row justify-between"><span>${startTime} - ${endTime}</span> ${weatherDiv}</div>
						<div class="h3 font-bold">${info.event.title}</div>
						<div>${userDiv}</div>
					</div>
					`
					return {html: eventContent}
				},
				eventTimeFormat: {
					hour: 'numeric',
					minute: '2-digit',
					meridiem: false
				}
			})
			cal.render()
		}

		//Media Queries for Calendar View
		const mediaQuery = window.matchMedia('(width <= 860px)')
		mediaQuery.addEventListener('change', ({matches}) => {
			if (matches) {
				disabledMobile = true
				cal?.changeView('listWeek')
			} else {
				disabledMobile = false
				cal?.changeView('dayGridMonth')
			}
		})
		if (mediaQuery.matches) {
			disabledMobile = true
			cal?.changeView('listWeek')
		} else {
			disabledMobile = false
			cal?.changeView('dayGridMonth')
		}
	})
</script>

<div class="m-3 print:hidden">
	<ButtonGroup>
		<Button outline color="dark" on:click={cal?.changeView('listDay')}>{$_('home.day-view')}</Button>
		<Button outline color="dark" on:click={cal?.changeView('listWeek')}>{$_('home.week-view')}</Button>
		{#if !disabledMobile}
			<Button outline color="dark" on:click={cal?.changeView('dayGridMonth')}>{$_('home.month-view')}</Button>
		{/if}
	</ButtonGroup>
</div>

<div id="calendar" class="w-full">
	<div class="text-center"><Spinner /></div>
</div>
