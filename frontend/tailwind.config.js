/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // LevelUp Theme Colors
        'levelup-dark': '#0D3B36',
        'levelup-darker': '#092925',
        'levelup-accent': '#C4D600',
        'levelup-accent-hover': '#D4E600',
        'levelup-teal': '#0D4D45',
        'levelup-light': '#F5F7F7',
        // Microsoft Colors
        'ms-blue': '#0078D4',
        'ms-dark-blue': '#004C87',
        'ms-green': '#107C10',
      },
      fontFamily: {
        'segoe': ['Segoe UI', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

