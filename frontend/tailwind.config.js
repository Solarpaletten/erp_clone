/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        solar: {
          'sidebar-dark': '#0f3c4c',
          'sidebar-darker': '#0a2e3b',
          'sidebar-hover': '#165468',
          primary: '#f7931e',
          'primary-hover': '#e67e00',
          button: '#ff6900',
          'button-hover': '#e05e00',
        },
      },
    },
  },
  plugins: [],
};
