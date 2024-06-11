import flowbite from 'flowbite/plugin'
import type { Config } from 'tailwindcss'

let colors

switch (process.env.PPOCGEN_ENV) {
	case 'production':
    colors = {
      primary: {
        50: '#fff5f2',
        100: '#fff1ee',
        200: '#ffe4de',
        300: '#ffd5cc',
        400: '#ffbcad',
        500: '#fe795d',
        600: '#ef562f',
        700: '#eb4f27',
        800: '#cc4522',
        900: '#a5371b'
      }
    }
	  break;
	case 'staging':
    colors = {
      primary: {
        50: '#f2fdff',
        100: '#eefbff',
        200: '#def9ff',
        300: '#ccf4ff',
        400: '#adefff',
        500: '#5ddbfe',
        600: '#2fc2ef',
        700: '#27bdeb',
        800: '#22a2cc',
        900: '#1b83a5'
      }
    }
	  break;
	default:
    colors = {
      primary: {
        50: '#f2fffb',
        100: '#eefffa',
        200: '#defff5',
        300: '#ccffec',
        400: '#adffdd',
        500: '#5dfe9d',
        600: '#2fef5f',
        700: '#27eb4e',
        800: '#2acc22',
        900: '#1ba534'
      }
    }
}

export default {
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}', './node_modules/flowbite/**/*.js', './node_modules/flowbite-svelte-icons/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        print: { raw: 'print'}
      },
      colors: colors
    }
  },
  plugins: [
    flowbite
  ],
} satisfies Config
