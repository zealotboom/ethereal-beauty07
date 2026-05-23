import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:           "var(--bg)",
        surface:      "var(--surface)",
        card:         "var(--card)",
        gold:         "var(--gold)",
        "gold-light": "var(--gold-light)",
        ocean:        "var(--ocean)",
        "ocean-deep": "var(--ocean-deep)",
        "ocean-light":"var(--ocean-light)",
        primary:      "var(--text-primary)",
        muted:        "var(--text-muted)",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        sans:    ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
