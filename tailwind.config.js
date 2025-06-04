/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Next.js App Router
    "./pages/**/*.{js,ts,jsx,tsx}", // For traditional Next.js projects
    "./components/**/*.{js,ts,jsx,tsx}", // Custom components
  ],
  theme: {
    extend: {
      colors: {
        heading: '#1D0891',
        heading2: '#1E3CA7',
        normal: '#2B2B2BAB',
      },
    },
  },
  plugins: [],
};
