/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        steal: '#10b981',    // emerald-500
        fair: '#eab308',     // yellow-400
        overpay: '#f97316',  // orange-500
      },
      animation: {
        'gradient-slow': 'gradient-float 15s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease-in-out infinite',
      },
      keyframes: {
        'gradient-float': {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
            opacity: '0.3',
          },
          '33%': {
            transform: 'translate(10%, 10%) scale(1.1)',
            opacity: '0.4',
          },
          '66%': {
            transform: 'translate(-5%, 5%) scale(0.95)',
            opacity: '0.25',
          },
        },
        'gradient-shift': {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
