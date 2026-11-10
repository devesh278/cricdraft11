/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#ff4d3a',
          'red-hover': '#e03e2c',
          cream: '#f5f4ef',
          canvas: '#faf9f5',
          dark: '#111827',
          card: '#ffffff',
          gold: '#eab308',
          green: '#0f3e2e',
        },
        pitch: {
          grass: '#1e6840',
          stripe: '#24754a',
          strip: '#d1be9a',
          line: 'rgba(255, 255, 255, 0.65)',
          dash: 'rgba(253, 224, 71, 0.8)',
        },
      },
      fontFamily: {
        headline: ['"Bebas Neue"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      animation: {
        'roll-reveal': 'rollReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'scale-up': 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        rollReveal: {
          '0%': { transform: 'scale(0.92) translateY(12px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
