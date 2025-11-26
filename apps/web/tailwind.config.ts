import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#1a73e8",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f3e8fd",
          foreground: "#9334e6",
        },
        success: {
          DEFAULT: "#34a853",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f9ab00",
          foreground: "#000000",
        },
        error: {
          DEFAULT: "#ea4335",
          foreground: "#ffffff",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
