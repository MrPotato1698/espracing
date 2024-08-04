/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		fontFamily: {
			monserrat: ["Monserrat", "cursive"],
		},
		color:{
			transparent: 'transparent',
			current: 'currentColor',
			'redESP': '#da392b',
			'black0f': '#0f0f0f',
			'black19': '#19191c',
			'whitef9': '#f9f9f9',
			'whitef7': '#f7f7f7',
		},
		extend: {},
	},
	plugins: [,
		require('@tailwindcss/aspect-ratio'),
	],
}
