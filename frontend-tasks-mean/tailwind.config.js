/** @type {import('tailwindcss').Config} */ 
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        background: '#F9FAFB',
        surface: '#FFFFFF',
        accent: '#2563EB',         
        'accent-light': '#60A5FA',
        'accent-dark': '#1E3A8A',
        'neutral-50': '#F9FAFB',
        'neutral-100': '#F3F4F6',
        'neutral-200': '#E5E7EB',
        'neutral-300': '#D1D5DB',
        'neutral-400': '#9CA3AF',
        'neutral-500': '#6B7280',
        'neutral-600': '#4B5563',
        'neutral-700': '#374151',
        'neutral-800': '#1F2937',
        'neutral-900': '#111827',
      },
      fontFamily: {
        inter: ['"Inter"', 'sans-serif'],
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
