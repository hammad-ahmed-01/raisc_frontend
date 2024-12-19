/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        raiscPrimary: "#4C6EF5", // Primary bluish color
        raiscSecondary: "#F0F4FF", // Light bluish background
        raiscAccent: "#FFB800", // Accent color
      },
    },
  },
  plugins: [],
};
