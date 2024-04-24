import Dexie, {type Table} from 'dexie'
import type {Congregation} from './models/congregation'
import type {User} from './models/user'
import type {Availability} from './models/availability'
import type {Incidence} from './models/incidence'
import type {Schedule} from './models/schedule'
import type {Turn} from './models/turn'
import type {Assignment} from './models/assignment'
import type {Affinity} from './models/affinity'

export class MySubClassedDexie extends Dexie {
	congregation!: Table<Congregation>
	user!: Table<User>
	availability!: Table<Availability>
	incidence!: Table<Incidence>
	schedule!: Table<Schedule>
	turn!: Table<Turn>
	assignment!: Table<Assignment>
	affinity!: Table<Affinity>

	constructor() {
		super('ppocgen')
		this.version(1).stores({
			congregation: '++id, name, lang, week_order',
			user: '++id,firstname, lastname, gender, weight, counter, [firstname+lastname]',
			availability: '++id, user_id, schedule_id',
			incidence: '++id, user_id, start_date, end_date',
			schedule: '++id, weekday, start_time, end_time, location, n_brothers, n_sisters',
			turn: '++id, date, start_time, end_time, location, n_brothers, n_sisters, [date+start_time+end_time+location]',
			assignment: '++id, user_id, turn_id, [user_id+turn_id]',
			affinity: '++id, source_id, destination_id'
		})
	}
}

export const db = new MySubClassedDexie()
