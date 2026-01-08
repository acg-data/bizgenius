import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        apple: {
          bg: '#F5F5F7',
          card: '#FFFFFF',
          text: '#1D1D1F',
          gray: '#86868b',
          blue: '#0071e3',
          border: '#d2d2d7',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0071e3',
          600: '#0077ED',
          700: '#005BB5',
          800: '#004A93',
          900: '#003A75',
        },
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'float': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        'device': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.1), 0 4px 20px -2px rgba(0, 0, 0, 0.06)',
        'input': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'input-focus': '0 0 0 4px rgba(0, 113, 227, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
        'glass-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float-blob': 'floatBlob 10s infinite ease-in-out',
        'float-blob-delayed': 'floatBlob 10s infinite ease-in-out 2s',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        floatBlob: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(20px, -20px)' },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}
