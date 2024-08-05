import {addMessages, init, getLocaleFromNavigator} from 'svelte-i18n'

//With all these languages in theory we cover 98% of the population in the world
//covering second languages, and basic knowledge of some of them
//most of the translations were created using AI so we may need to correct
//some mistakes and fine-tune the translations

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
import ar from './ar.json'
import it from './it.json'
import gr from './gr.json'
import pl from './pl.json'
import bg from './bg.json'
import no from './no.json'
import fi from './fi.json'
import se from './se.json'
import tr from './tr.json'
import th from './th.json'
import ur from './ur.json'
import cz from './cz.json'
import bn from './bn.json'
import vn from './vn.json'
import id from './id.json'
import fa from './fa.json'

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
addMessages('ar', ar)
addMessages('it', it)
addMessages('gr', gr)
addMessages('pl', pl)
addMessages('bg', bg)
addMessages('no', no)
addMessages('fi', fi)
addMessages('se', se)
addMessages('tr', tr)
addMessages('th', th)
addMessages('ur', ur)
addMessages('cz', cz)
addMessages('bn', bn)
addMessages('vn', vn)
addMessages('id', id)
addMessages('fa', fa)

export function initLocale() {
	init({
		fallbackLocale: 'en',
		initialLocale: getLocaleFromNavigator()
	})
}
