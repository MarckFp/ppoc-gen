import {
  createAppleSplashScreens,
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config'

let image = 'static/favicon.svg'

switch (process.env.PPOCGEN_ENV) {
	case 'production':
		image = 'static/favicon.svg'
	  break;
	case 'staging':
		image = 'static/staging.svg'
	  break;
	default:
		image = 'static/localhost.svg'
}

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...minimal2023Preset,
    appleSplashScreens: createAppleSplashScreens({
      padding: 0.3,
      resizeOptions: { fit: 'contain', background: 'white' },
      darkResizeOptions: { fit: 'contain', background: 'black' },
      linkMediaOptions: {
        log: true,
        addMediaScreen: true,
        xhtml: true,
      },
    }, ['iPad Air 9.7"']),
  },
  images: image,
})