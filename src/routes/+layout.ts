import {addMessages, init, getLocaleFromNavigator} from 'svelte-i18n'

import en from '../i18n/en.json'
import es from '../i18n/es.json'
import fr from '../i18n/fr.json'
addMessages('en', en)
addMessages('es', es)
addMessages('fr', fr)
init({
	fallbackLocale: 'en',
	initialLocale: getLocaleFromNavigator()
})

export const prerender = true
export const ssr = false
export const trailingSlash = 'never'
