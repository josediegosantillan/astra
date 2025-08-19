/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{html,js,css}',
		'./pags/**/*.{html,js}',
		'./index.html'
	],
	theme: {
		extend: {},
	},
		safelist: [
			// clases magenta usadas dinámicamente desde JS
			'bg-magenta-50', 'bg-magenta-100', 'bg-magenta-200', 'bg-magenta-300', 'bg-magenta-400', 'bg-magenta-500', 'bg-magenta-600', 'bg-magenta-700', 'bg-magenta-800', 'bg-magenta-900',
			'text-magenta-500', 'border-magenta-400',
			// incluir variantes con opacity como bg-magenta-200/30
			{ pattern: /bg-magenta-(50|100|200|300|400|500|600|700|800|900)(\/[0-9]{1,3})?/ },
			'bg-magenta-200/50'
		],
	plugins: [],
}

