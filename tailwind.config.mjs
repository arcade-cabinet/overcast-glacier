/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary: '#0F172A',
				'accent-ice': '#7DD3FC',
				'snow-white': '#F8FAFC',
				'glacier-blue': '#1E40AF',
				'frost-highlight': '#60A5FA',
				'warning-red': '#EF4444',
				'hot-cocoa': '#8B4513',
				'matrix-green': '#10B981',
			},
			fontFamily: {
				heading: ['Orbitron', 'sans-serif'],
				body: ['VT323', 'monospace'],
				accent: ['Luckiest Guy', 'cursive'],
			},
		},
	},
	plugins: [],
}
