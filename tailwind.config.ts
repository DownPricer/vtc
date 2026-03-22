import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#FF8533",
          dark: "#E07A2E",
          light: "#FFA366",
        },
        dark: {
          DEFAULT: "#0A0A0A",
          medium: "#1A1A1A",
          light: "#2A2A2A",
        },
        surface: {
          DEFAULT: "#1C1C1C",
          hover: "#252525",
        },
        gray: {
          vtc: "#404040",
          medium: "#606060",
          light: "#808080",
        },
      },
      boxShadow: {
        glow: "0 0 8px rgba(255, 133, 51, 0.2)",
        "glow-lg": "0 0 20px rgba(255, 133, 51, 0.3)",
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease",
        slideUp: "slideUp 0.4s ease",
        pulse: "pulse 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
