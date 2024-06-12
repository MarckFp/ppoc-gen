import {addMessages, init, getLocaleFromNavigator} from 'svelte-i18n'

import en from '../i18n/en.json'
import es from '../i18n/es.json'
import fr from '../i18n/fr.json'
import pt from '../i18n/pt.json'
import de from '../i18n/de.json'
import zh from '../i18n/zh.json'
import hi from '../i18n/hi.json'
import ro from '../i18n/ro.json'
import jp from '../i18n/jp.json'

addMessages('en', en)
addMessages('es', es)
addMessages('fr', fr)
addMessages('pt', pt)
addMessages('de', de)
addMessages('zh', zh)
addMessages('hi', hi)
addMessages('ro', ro)
addMessages('jp', jp)

init({
	fallbackLocale: 'en',
	initialLocale: getLocaleFromNavigator()
})

export const prerender = true
export const ssr = false
export const trailingSlash = 'never'
