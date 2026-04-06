/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#8b5cf6",
        secondary: "#3b82f6",
        background: "#17182b",
        card: "#21233a",
        textMain: "#ffffff",
        textMuted: "#a0a3bd",
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      boxShadow: {
        'dark-neumorphic': '8px 8px 16px #0e0f1a, -8px -8px 16px #20213c',
        'dark-neumorphic-sm': '4px 4px 8px #0e0f1a, -4px -4px 8px #20213c',
        'dark-neumorphic-inset': 'inset 4px 4px 8px #0e0f1a, inset -4px -4px 8px #20213c',
      }
    },
    plugins: [],
  },
};
