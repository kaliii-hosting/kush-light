/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#CB6015',
        'primary-hover': '#E06A17',
        'primary-dark': '#A14F11',
        'black': '#000000',
        'gray-darkest': '#0A0A0A',
        'gray-darker': '#141414',
        'gray-dark': '#1F1F1F',
        'gray': '#2A2A2A',
        'gray-light': '#404040',
        'gray-lighter': '#606060',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B3B3B3',
        'text-tertiary': '#808080',
        'card': '#0F0F0F',
        'card-hover': '#1A1A1A',
        'border': '#2A2A2A',
        // Spotify theme colors
        'spotify-green': '#1DB954',
        'spotify-green-hover': '#1ed760',
        'spotify-gray': '#121212',
        'spotify-light-gray': '#181818',
        'spotify-card': '#181818',
        'spotify-card-hover': '#282828',
        'spotify-text-subdued': '#b3b3b3',
      },
      fontFamily: {
        'sans': ['Circular', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        '80': '80px',
        '60': '60px',
        '36': '36px',
      },
      spacing: {
        '131': '131px',
        '247': '247px',
      },
      borderRadius: {
        '20': '20px',
        '30': '30px',
      },
      animation: {
        'scroll': 'scroll 30s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(71, 139, 235, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(71, 139, 235, 0.8), 0 0 40px rgba(71, 139, 235, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}