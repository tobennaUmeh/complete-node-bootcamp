// const colors = require('tailwindcss/colors');

module.exports = {
	content: ['index.html', './src/**/*.{js,jsx,ts,tsx,vue,html}'],
	theme: {
		extend: {
			backgroundImage: {
				heroSection: 'url(/assets/heroSectionblur.png)',
			},
			colors: {
				primary: {
					100: 'rgba(73, 30, 208, 1)',
					200: 'rgba(31, 13, 88, 1)',
					300: 'rgba(196, 238, 252, 0.2)',
					400: 'rgba(243, 252, 254, 1)',
				},
				secondary: {
					100: 'rgba(255, 126, 84, 1)',
					200: 'rgba(255, 126, 84, 0.64)',
				},
			},
		},
	},
	plugins: [],
};
