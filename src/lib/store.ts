import {writable} from 'svelte/store'

export const toastMessageAlert = writable('Default message')
export const toastMessageWarning = writable('Default message')
export const toastMessageSuccess = writable('Default message')
export const toastAlert = writable(false)
export const toastWarning = writable(false)
export const toastSuccess = writable(false)
