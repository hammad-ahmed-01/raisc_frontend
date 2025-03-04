/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Next.js App Router
    "./pages/**/*.{js,ts,jsx,tsx}", // For traditional Next.js projects
    "./components/**/*.{js,ts,jsx,tsx}", // Custom components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
