/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'ms-blue': '#0078D4',
        'ms-dark-blue': '#004C87',
        'ms-light-blue': '#50E6FF',
        'ms-green': '#107C10',
        'ms-orange': '#D83B01',
        'levelup-blue': '#0070AD',
        'levelup-green': '#00A651',
        'levelup-dark': '#1A1A1A',
      },
      fontFamily: {
        'segoe': ['Segoe UI', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
