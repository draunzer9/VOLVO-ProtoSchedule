import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        proto: {
          dark: "#0B111E",
          card: "#131E31",
          cardHover: "#182740",
          border: "#203350",
          borderLight: "#2E476D",
          primary: "#0077C8",
          primaryHover: "#008FE0",
          navy: "#003057",
          navyDark: "#001E38",
          cyan: "#38BDF8",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
          purple: "#A855F7",
          steel: "#94A3B8",
          light: "#F8FAFC",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(0, 119, 200, 0.3)",
        glowAmber: "0 0 25px -5px rgba(245, 158, 11, 0.3)",
        glowRose: "0 0 25px -5px rgba(244, 63, 94, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
