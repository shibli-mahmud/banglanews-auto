/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        news: {
          red: "#9f1239",
          ink: "#111827"
        }
      },
      maxWidth: {
        news: "72rem"
      }
    }
  },
  plugins: []
};
