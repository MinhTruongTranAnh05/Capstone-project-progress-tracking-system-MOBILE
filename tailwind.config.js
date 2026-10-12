/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E65100',
          dark: '#D84315',
          50: '#FFF3E0',
          100: '#FFE0B2',
        },
        background: '#FBF9F5',
        surface: '#FFFFFF',
        text: {
          DEFAULT: '#2C2825',
          secondary: '#6B635B',
        },
        border: '#E8E2D9',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['System', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
