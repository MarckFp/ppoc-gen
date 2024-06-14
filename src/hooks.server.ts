import {sequence} from '@sveltejs/kit/hooks'
import * as Sentry from '@sentry/sveltekit'

const environment = import.meta.env.PPOCGEN_ENV ? import.meta.env.PPOCGEN_ENV : 'development'
const version = PKG.version ?? 'unknown'

Sentry.init({
	dsn: 'https://5205d8d0643f4c5783d29b1c19c5467f@o4507226104922112.ingest.de.sentry.io/4507226107543632',
	tracesSampleRate: 1.0,
	environment: environment,
	release: version
})

export const handle = sequence(Sentry.sentryHandle())
export const handleError = Sentry.handleErrorWithSentry()
