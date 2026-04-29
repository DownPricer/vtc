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
          DEFAULT: "var(--primary)",
          dark: "var(--primary-dark)",
          light: "var(--primary-light)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          dark: "var(--secondary-dark)",
        },
        dark: {
          DEFAULT: "var(--background)",
          medium: "var(--dark-medium)",
          light: "var(--dark-light)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
        },
        gray: {
          vtc: "var(--gray-deep)",
          medium: "var(--muted-strong)",
          light: "var(--muted)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
      },
      boxShadow: {
        glow: "0 0 8px rgba(var(--primary-rgb), 0.2)",
        "glow-lg": "0 0 20px rgba(var(--primary-rgb), 0.3)",
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
