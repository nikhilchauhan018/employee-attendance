/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f0f6',
          100: '#e0e0ec',
          200: '#c5c4d9',
          300: '#a9a8c5',
          400: '#8d8cb2',
          500: '#5b5a8e',
          600: '#4d4c7a',
          700: '#3d3c6b',
          800: '#2f2e54',
          900: '#2c2c54',
        },
        sidebar: {
          from: '#5b5a8e',
          to: '#3d3c6b',
        },
        dark: '#2c2c54',
        muted: '#8c8ca1',
        surface: '#f8f8fb',
        'stat-pink': '#ffe4e4',
        'stat-blue': '#e4e4ff',
        'stat-yellow': '#fff4e4',
        'stat-green': '#e4ffe4',
      },
    },
  },
  plugins: [],
};
