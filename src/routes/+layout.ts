import {addMessages, init, getLocaleFromNavigator} from 'svelte-i18n'

import en from '../i18n/en.json'
import es from '../i18n/es.json'
addMessages('en', en)
addMessages('es', es)
init({
	fallbackLocale: 'en',
	initialLocale: getLocaleFromNavigator()
})

export const prerender = true
export const ssr = false
