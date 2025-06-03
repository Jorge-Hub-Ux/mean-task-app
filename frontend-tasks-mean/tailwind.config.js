/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#F59E0B',
      },
      fontFamily: {
        inter: ['"Inter", sans-serif'],
      },
      gridTemplateColumns: {
        sidebar: 'min-content 1fr',
      },
      gridTemplateRows: {
        header: 'min-content 1fr',
      },
      animation: {
        'scale-pulse': 'scale-pulse 1s ease-in-out infinite',
      },
      keyframes: {
        'scale-pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

