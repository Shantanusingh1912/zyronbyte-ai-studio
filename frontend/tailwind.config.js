/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gaming: {
          bg: '#0B0E14',
          card: '#151922',
          border: '#232936',
          accent: '#6366F1',
          neon: '#00F5FF',
          yellow: '#FFDD00',
          danger: '#EF4444',
          success: '#10B981'
        }
      }
    },
  },
  plugins: [],
}
