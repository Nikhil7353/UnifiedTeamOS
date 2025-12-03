/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',    // Sidebar
          primary: '#6366f1', // Buttons
          secondary: '#334155', 
        }
      }
    },
  },
  plugins: [],
}