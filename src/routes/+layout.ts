import {initLocale} from '$lib/i18n/i18n'
import type {LayoutLoad} from './$types'
import {db} from '$lib/db'

initLocale()

export const prerender = true
export const ssr = false
export const trailingSlash = 'never'

export const load: LayoutLoad = async () => {
	return {congregation: await db.congregation.orderBy('id').first()}
}
