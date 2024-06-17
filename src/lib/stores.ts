import {writable} from 'svelte/store'

export const mobile = writable(false)

//Turns
export const genTurnsLoading = writable(false)
export const genTurnsButtonDisabled = writable(false)

//Congregation
const week_order = 'monday',
	name_order = 'firstname'

export const weekOrder = writable(week_order)
export const nameOrder = writable(name_order)
