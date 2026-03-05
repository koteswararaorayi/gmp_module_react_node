/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8f3",
          100: "#d8efe4",
          500: "#2e7d5b",
          700: "#1f5b41",
          900: "#153a2b",
        },
      },
    },
  },
  plugins: [],
};
