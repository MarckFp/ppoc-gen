import {addMessages, init, getLocaleFromNavigator} from 'svelte-i18n'

import en from '../i18n/en.json'
import es from '../i18n/es.json'
import fr from '../i18n/fr.json'
import pt from '../i18n/pt.json'
import de from '../i18n/de.json'
addMessages('en', en)
addMessages('es', es)
addMessages('fr', fr)
addMessages('pt', pt)
addMessages('de', de)
init({
	fallbackLocale: 'en',
	initialLocale: getLocaleFromNavigator()
})

export const prerender = true
export const ssr = false
export const trailingSlash = 'never'
