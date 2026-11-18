/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cookie: {
          50: '#FDFBF7',
          100: '#F7F2EA',
          200: '#EFE5D5',
          300: '#E0CCB0',
          400: '#C7A77F',
          500: '#B08855',
          600: '#8E6738',
          700: '#6E4D26',
          800: '#4A2E1B',
          900: '#321D10',
          950: '#1D0F08',
        },
        caramel: {
          DEFAULT: '#D97706',
          light: '#FDE68A',
          dark: '#B45309',
        },
        cream: '#FFFDF9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'warm': '0 10px 25px -5px rgba(74, 46, 27, 0.08), 0 8px 10px -6px rgba(74, 46, 27, 0.05)',
        'warm-lg': '0 20px 30px -10px rgba(74, 46, 27, 0.12), 0 10px 15px -5px rgba(74, 46, 27, 0.08)',
      }
    },
  },
  plugins: [],
}
