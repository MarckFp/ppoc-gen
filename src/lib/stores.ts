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

//PWA
export const installPrompt = writable(
	window.localStorage.getItem('installPrompt') ? window.localStorage.getItem('installPrompt') : 'false'
)

installPrompt.subscribe(value => {
	window.localStorage.setItem('installPrompt', value)
})
