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
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          500: '#f97316', // Vibrant Dabba Orange
          600: '#ea580c',
          700: '#c2410c',
          900: '#7c2d12',
        },
        accent: {
          50: '#f0fdf4',
          500: '#22c55e', // Veg Green
          600: '#16a34a',
        },
        warn: {
          50: '#fef2f2',
          500: '#ef4444', // Non-Veg Red
          600: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
}
