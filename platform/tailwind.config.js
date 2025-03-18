import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      light: {
        extend: 'light',
        colors: {
          background: '#E6E7D7',
          primary: {
            DEFAULT: '#ED642D',
            foreground: '#ffffff'
          },
          secondary: {
            DEFAULT: '#AFAD96',
            foreground: '#18190B'
          }
        }
      }
    }
  })],
};

export default config;
