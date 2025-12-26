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
        sans: ['Inter', 'sans-serif'],
        mono: ['Courier Prime', 'monospace'],
      },
      colors: {
        ink: '#18181b',
        paper: '#FDFBF7',
        manilla: {
          light: '#F7EBCB',
          DEFAULT: '#E6D5B0',
          dark: '#D4C39E',
        },
        cyan: {
          DEFAULT: '#00F0FF',
          hover: '#00D6E4',
          dim: 'rgba(0, 240, 255, 0.1)',
        },
        marker: '#FDFF00',
        alert: '#FF4D4D',
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      boxShadow: {
        'brutal': '5px 5px 0px 0px #18181b',
        'brutal-lg': '10px 10px 0px 0px #18181b',
        'brutal-sm': '3px 3px 0px 0px #18181b',
        'inner-hard': 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'print': 'print 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'shake': 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        print: {
          '0%': { height: '0', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { height: '380px', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}
