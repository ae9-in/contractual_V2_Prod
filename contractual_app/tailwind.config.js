/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6d9c9f",
          dark: "#2d7a7e",
          light: "#e8f4f5",
        },
        secondary: "#f1f5e2",
        "bg-main": "#ffffff",
        "bg-alt": "#f7f9f0",
        "dark-surface": "#1a1a2e",
        "dark-card": "#252542",
        "cta-amber": {
          DEFAULT: "#f59e0b",
          dark: "#d97706",
        },
        "text-primary": "#1c2b2c",
        "text-secondary": "#62737a",
        border: "#d8e4e5",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
      },
      fontFamily: {
        sans: ["Jakarta", "sans-serif"],
        display: ["Josefin", "sans-serif"],
      },
    },
  },
  plugins: [],
};
