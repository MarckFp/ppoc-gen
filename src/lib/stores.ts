import {writable} from 'svelte/store'
import {db} from '$lib/db'

export const mobile = writable(false)

//Turns
export const genTurnsLoading = writable(false)
export const genTurnsButtonDisabled = writable(false)

//Congregation
const congregation = await db.congregation.orderBy('id').first()

export const weekOrder = writable(congregation?.week_order)
export const nameOrder = writable(congregation?.name_order)
