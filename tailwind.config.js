/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fef9ed", // Warm Cream
        primary: "#6c1806", // Terracotta Red
        "primary-container": "#8c2f1b",
        secondary: "#2d4232", // Muted Forest Green
        "secondary-container": "#d0e9d2",
        tertiary: "#4b2c20", // Coffee Bean
        "tertiary-container": "#694639",
        "on-surface": "#1d1c15",
        "on-surface-variant": "#56423d",
        "surface-container-low": "#f8f3e7",
        "surface-container": "#f2ede2",
        "surface-container-high": "#ede8dc",
        "surface-container-highest": "#e7e2d6",
        "outline-variant": "#ddc0ba",
        "reddish-white": "#faf0ed", // Soft reddish-white
      },
      fontFamily: {
        serif: ["'Libre Caslon Text'", "serif"],
        sans: ["'Manrope'", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.125rem", // Soft
        lg: "0.25rem",
        xl: "0.5rem",
        "2xl": "0.75rem",
        full: "9999px",
      },
      spacing: {
        unit: "8px",
        gutter: "24px",
        "section-gap": "120px",
        "margin-mobile": "20px",
        "margin-desktop": "64px",
      }
    },
  },
  plugins: [],
}
