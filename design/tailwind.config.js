/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        canvas: { DEFAULT: "#E4F0A4", light: "#EDF5C4", dark: "#D4E488" },
        surface: { DEFAULT: "#FFFFFF", subtle: "#F5F5F0" },
        accent: { DEFAULT: "#7C6AF2", light: "#EDE9FE", medium: "#A394F5", dark: "#5B47D0" },
        txt: { primary: "#1A1A1A", secondary: "#6B6B6B", muted: "#ABABAB" },
        bdr: { DEFAULT: "#E8E8E4", subtle: "#F0F0EC" },
        status: {
          running: "#7C6AF2",
          completed: "#6BBF6A",
          waiting: "#F0C850",
          failed: "#E87070",
          pending: "#CCCCCC",
        },
      },
      borderRadius: {
        card: "24px",
        "card-nested": "16px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.06)",
        modal: "0 8px 32px rgba(0,0,0,0.08)",
        dropdown: "0 4px 20px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
