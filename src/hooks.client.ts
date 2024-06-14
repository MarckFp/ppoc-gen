import * as Sentry from '@sentry/sveltekit'
import * as Spotlight from '@spotlightjs/spotlight'

const environment = import.meta.env.VITE_PPOCGEN_ENV ? import.meta.env.VITE_PPOCGEN_ENV : 'development'
const version = PKG.version ?? 'unknown'

Sentry.init({
	dsn: 'https://5205d8d0643f4c5783d29b1c19c5467f@o4507226104922112.ingest.de.sentry.io/4507226107543632',
	tracesSampleRate: 1.0,
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1.0,
	integrations: [Sentry.replayIntegration(), Sentry.browserProfilingIntegration()],
	transport: Sentry.makeBrowserOfflineTransport(Sentry.makeFetchTransport),
	environment: environment,
	spotlight: environment === 'development',
	release: version
})

export const handleError = Sentry.handleErrorWithSentry()

if (environment == 'development') {
	Spotlight.init({
		injectImmediately: true
	})
}
