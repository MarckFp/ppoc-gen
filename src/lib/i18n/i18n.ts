import {addMessages, init, getLocaleFromNavigator} from 'svelte-i18n'

import en from './en.json'
import es from './es.json'
import fr from './fr.json'
import pt from './pt.json'
import de from './de.json'
import hi from './hi.json'
import ro from './ro.json'
import zh from './zh.json'
import jp from './jp.json'
import ko from './ko.json'
import ru from './ru.json'
//import ar from './ar.json'
import it from './it.json'
import gr from './gr.json'
import pl from './pl.json'

addMessages('en', en)
addMessages('es', es)
addMessages('fr', fr)
addMessages('pt', pt)
addMessages('de', de)
addMessages('hi', hi)
addMessages('ro', ro)
addMessages('zh', zh)
addMessages('jp', jp)
addMessages('ko', ko)
addMessages('ru', ru)
//addMessages('ar', ar) //TODO: We need to support to serve the page on a different word order since it's red from left to right instead of right to left
addMessages('it', it)
addMessages('gr', gr)
addMessages('pl', pl)

export function initLocale() {
	init({
		fallbackLocale: 'en',
		initialLocale: getLocaleFromNavigator()
	})
}
