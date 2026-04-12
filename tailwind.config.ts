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
        // Background
        bg: "#0E0E10",
        sidebar: "#141416",
        card: "#141416",
        // Borders & Dividers
        border: "#2A2A2E",
        divider: "#1E1E22",
        // Text
        "text-primary": "#F0EEE8",
        "text-secondary": "#C8C6BF",
        "text-muted": "#555558",
        "text-label": "#444448",
        // Accents
        gold: "#C8B89A",
        sage: "#7B9E87",
        "accent-red": "#BF7B7B",
        amber: "#E8A84C",
      },
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
      borderWidth: {
        "0.5": "0.5px",
      },
    },
  },
  plugins: [],
};
export default config;
