import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		fontFamily: {
			monserrat: ["Monserrat", "cursive"],
		},
		extend: {
			colors: {
				transparent: 'transparent',
				current: 'currentColor',
				'primary': '#da392b', //redESP
				'dark-primary': '#0f0f0f', //black0f
				'dark-second': '#19191c',	//black19
				'light-primary': '#f9f9f9', //whitef9
				'light-second': '#f7f7f7', //whitef7
			},
		},
	},

	corePlugins: {
		container: false,
	},
	plugins: [
		require('@tailwindcss/aspect-ratio'),
	],
} satisfies Config;
