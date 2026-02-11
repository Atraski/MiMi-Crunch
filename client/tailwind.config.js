/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f8f6f2',
          100: '#f2ede4',
          600: '#d4833b',
          900: '#2d4a2a',
        },
      },
    },
  },
  plugins: [],
}
