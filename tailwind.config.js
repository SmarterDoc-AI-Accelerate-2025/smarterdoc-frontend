/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        paper: {
          1: "var(--paper-1)",
          2: "var(--paper-2)",
          overlay: "var(--paper-overlay)",
        },
        border: {
          divider: "var(--border-divider)",
          border: "var(--border-border)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          disable: "var(--text-disable)",
        },
        primary: {
          main: "var(--primary-main)",
          support: "var(--primary-support)",
        },
      },
    },
  },
  plugins: [],
};
