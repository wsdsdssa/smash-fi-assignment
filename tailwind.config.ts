import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0d0d0d",
        surface: "#161616",
        muted: "#1f1f1f",
        border: "rgba(255,255,255,0.06)",
        accent: "#2563eb",
        positive: "#22c55e",
        negative: "#f97316",
        text: {
          DEFAULT: "#f9fafb",
          muted: "#9ca3af",
        },
      },
      boxShadow: {
        glow: "0 15px 40px rgba(0, 0, 0, 0.45)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;

