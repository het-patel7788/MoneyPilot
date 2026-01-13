/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // This file is optional in v4, but we use it to define colors cleanly
  theme: {
    extend: {
      colors: {
        background: '#0f172a', 
        surface: '#1e293b',    
        mint: {
          DEFAULT: '#10b981',
          neon: '#00f2ea',
        },
        accent: {
          red: '#ef4444',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}