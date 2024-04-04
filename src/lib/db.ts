import Dexie, { type Table } from 'dexie';
import type { Congregation } from './models/congregation';
import type { User } from './models/user';
import type { Availability } from './models/avaialbility';
import type { Incidence } from './models/incidence';
import type { Schedule } from './models/schedule';
import type { Turn } from './models/turn';

export class MySubClassedDexie extends Dexie {
  congregation!: Table<Congregation>;
  user!: Table<User>;
  availability!: Table<Availability>;
  incidence!: Table<Incidence>;
  schedule!: Table<Schedule>;
  turn!: Table<Turn>;

  constructor() {
    super('ppocgen');
    this.version(1).stores({
      congregation: '++id, name, n_carts', // Primary key and indexed props
      user: '++id,firstname, lastname, gender, weight, counter',
      availability: '++id, user_id, schedule_id',
      incidence: '++id, user_id, start_date, end_date',
      schedule: '++id, weekday, start_time, end_time, n_carts, location, n_brothers, n_sisters',
      turn: '++id, date, start_time, end_time'
    });
  }
}

export const db = new MySubClassedDexie();