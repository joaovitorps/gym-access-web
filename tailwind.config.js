/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F5F5F3",
        surface: "#FFFFFF",
        "text-primary": "#111111",
        "text-secondary": "#6B6B6B",
        accent: "#FF4D00",
        success: "#007A5E",
        error: "#C72C2C",
      },
      fontFamily: {
        heading: ['"Space Grotesk"', "sans-serif"],
        body: ['Inter', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
