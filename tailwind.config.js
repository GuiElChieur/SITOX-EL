/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: {
          800: "#1c2541",
          900: "#0b132b",
        },
        brand: {
          blue: "#00a2ff",
        }
      }
    },
  },
  plugins: [],
}

