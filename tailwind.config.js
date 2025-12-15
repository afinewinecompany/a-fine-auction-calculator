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
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}
