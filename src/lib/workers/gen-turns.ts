import {db} from '$lib/db'

// listen for messages
addEventListener('message', async e => {
	const {payload} = e.data

	async function checkPublisherTurn(user_id: number, d: Date) {
		//Check if user has availability
		if (!userList.includes(user_id)) {
			return true
		}

		//Check if user has an incidence
		const incidences = await db.incidence.where({user_id: user_id}).toArray()
		for (const incidence of incidences) {
			if (
				incidence.start_date <= d.toISOString().split('T')[0] &&
				incidence.end_date >= d.toISOString().split('T')[0]
			) {
				return true
			}
		}

		//Check if user already exist on turns at the same day
		const sameDayTurns = await db.turn.where({date: d.toISOString().split('T')[0]}).toArray()
		for (const sameDayTurn of sameDayTurns) {
			if ((await db.assignment.where({turn_id: sameDayTurn.id, user_id: user_id}).toArray()).length != 0) {
				return true
			}
		}

		//Check if user already exist on turns on the previous day
		const previousDay = new Date(d.toISOString())
		previousDay.setDate(previousDay.getDate() - 1)
		const previousTurns = await db.turn.where({date: previousDay.toISOString().split('T')[0]}).toArray()
		for (const previousDayTurn of previousTurns) {
			if ((await db.assignment.where({turn_id: previousDayTurn.id, user_id: user_id}).toArray()).length != 0) {
				return true
			}
		}

		return false
	}

	const from = payload.from,
		to = payload.to,
		schedules = payload.schedules

	let brothers: number = 0,
		sisters: number = 0,
		userList = payload.userList

	//Loop over weekdays
	weekdayLoop: for (let d = from; d <= to; d.setDate(d.getDate() + 1)) {
		const weekday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][d.getDay()]

		//Check if the congregation has an incidence
		const congIncidences = await db.incidence.where({user_id: -1}).toArray()
		for (const incidence of congIncidences) {
			if (
				incidence.start_date <= d.toISOString().split('T')[0] &&
				incidence.end_date >= d.toISOString().split('T')[0]
			) {
				postMessage({
					type: 'warning',
					message: {type: 'turns.cong-inc', payload: {date: d.getDate(), weekday: weekday}}
				})
				continue weekdayLoop
			}
		}
		//Loop over schedules
		for (const schedule of schedules) {
			if (schedule.weekday === weekday && schedule.id != undefined) {
				//Check if Turn already exists
				if (
					await db.turn
						.where({
							date: d.toISOString().split('T')[0],
							start_time: schedule.start_time,
							end_time: schedule.end_time,
							location: schedule.location
						})
						.first()
				) {
					continue
				}

				const turn_id: number = await db.turn.add({
					date: d.toISOString().split('T')[0],
					start_time: schedule.start_time,
					end_time: schedule.end_time,
					location: schedule.location,
					status: 'OK'
				})

				const availabilities = await db.availability.where({schedule_id: schedule.id}).toArray()
				if (availabilities.length == 0) {
					postMessage({type: 'warning', message: {type: 'turns.no-availability', payload: {weekday: weekday}}})
				}
				userList = availabilities.map(availability => availability.user_id)
				const users = await db.user.where('id').anyOf(userList).sortBy('counter')
				if (users.length == 0) {
					await db.turn.update(turn_id, {status: 'turns.no-publishers'})
					postMessage({
						type: 'warning',
						message: {
							type: 'turns.no-publishers',
							payload: {
								day: d.getDay(),
								date: d.getDate(),
								start_time: schedule.start_time,
								end_time: schedule.end_time
							}
						}
					})
				}
				//Loop over users with Affinities
				userLoop: for (const user of users) {
					if (user && user.id) {
						if (
							(await checkPublisherTurn(user.id, d)) ||
							(brothers >= schedule.n_brothers && user.gender == 'male') ||
							(sisters >= schedule.n_sisters && user.gender == 'female')
						) {
							continue userLoop
						}

						const affinities = await db.affinity.where({source_id: user.id}).toArray()
						if (affinities.length > 0) {
							await db.assignment.add({
								user_id: user.id,
								turn_id: turn_id
							})
							await db.user.update(user.id, {
								counter: user.counter + user.weight
							})
							if (user.gender === 'male') {
								brothers++
							} else if (user.gender === 'female') {
								sisters++
							}
							//Loop over affinities
							affinitiesLoop: for (const affinity of affinities) {
								const affinityUser = await db.user.where({id: affinity.destination_id}).first()
								if (affinityUser && affinityUser.id) {
									if (await checkPublisherTurn(affinityUser.id, d)) {
										continue affinitiesLoop
									}
									await db.assignment.add({
										user_id: affinityUser.id,
										turn_id: turn_id
									})
									await db.user.update(affinityUser.id, {
										counter: affinityUser.counter + affinityUser.weight
									})
									if (affinityUser.gender === 'male') {
										brothers++
									} else if (affinityUser.gender === 'female') {
										sisters++
									}
								}
							}
						}
						if (schedule.n_brothers - brothers < 1 || schedule.n_sisters - sisters < 1) {
							break userLoop
						}
					}
				}
				//Loop over users without Affinities
				userLoop: for (const user of users) {
					if (user && user.id) {
						if (
							(await checkPublisherTurn(user.id, d)) ||
							(brothers >= schedule.n_brothers && user.gender == 'male') ||
							(sisters >= schedule.n_sisters && user.gender == 'female')
						) {
							continue userLoop
						}

						const affinities = await db.affinity.where({source_id: user.id}).toArray()
						if (affinities.length <= 0) {
							await db.assignment.add({
								user_id: user.id,
								turn_id: turn_id
							})
							await db.user.update(user.id, {
								counter: user.counter + user.weight
							})
							if (user.gender === 'male') {
								brothers++
							} else if (user.gender === 'female') {
								sisters++
							}
						}
					}
				}
				if (sisters < schedule.n_sisters) {
					await db.turn.update(turn_id, {status: 'turns.not-enough-sis'})
					postMessage({
						type: 'warning',
						message: {
							type: 'turns.not-enough-sis',
							payload: {
								day: d.getDay(),
								date: d.getDate(),
								start_time: schedule.start_time,
								end_time: schedule.end_time
							}
						}
					})
				}
				if (brothers < schedule.n_brothers) {
					await db.turn.update(turn_id, {status: 'turns.not-enough-bro'})
					postMessage({
						type: 'warning',
						message: {
							type: 'turns.not-enough-bro',
							payload: {
								day: d.getDay(),
								date: d.getDate(),
								start_time: schedule.start_time,
								end_time: schedule.end_time
							}
						}
					})
				}
			}
			userList = []
			brothers = 0
			sisters = 0
		}
	}
	postMessage({type: 'success', message: {type: 'turns.created'}})
})
