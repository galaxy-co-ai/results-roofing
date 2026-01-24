import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", "monospace"],
      },
      fontSize: {
        // Tight scale following Minor Second (1.067)
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],     // 11px
        xs: ["0.75rem", { lineHeight: "1rem" }],          // 12px
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],     // 13px
        base: ["0.875rem", { lineHeight: "1.25rem" }],    // 14px - default
        md: ["1rem", { lineHeight: "1.5rem" }],           // 16px
        lg: ["1.125rem", { lineHeight: "1.75rem" }],      // 18px
        xl: ["1.25rem", { lineHeight: "1.75rem" }],       // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }],        // 24px
        "3xl": ["2rem", { lineHeight: "2.25rem" }],       // 32px
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        // Tighter spacing for dense UI
        "0.5": "0.125rem",  // 2px
        "1": "0.25rem",     // 4px
        "1.5": "0.375rem",  // 6px
        "2": "0.5rem",      // 8px
        "2.5": "0.625rem",  // 10px
        "3": "0.75rem",     // 12px
        "4": "1rem",        // 16px
        "5": "1.25rem",     // 20px
        "6": "1.5rem",      // 24px
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
