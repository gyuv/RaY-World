import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // RaY-World signature palette — a warm "ray of light" system on deep night.
        ink: {
          950: "#07070b",
          900: "#0b0b12",
          850: "#101019",
          800: "#15151f",
          700: "#1d1d2a",
          600: "#282838",
          500: "#3a3a4d",
        },
        ray: {
          // Signature amber-gold ray.
          50: "#fff8ec",
          100: "#ffedcc",
          200: "#ffd98f",
          300: "#ffc355",
          400: "#ffab1f",
          500: "#f59109",
          600: "#d97205",
          700: "#b45309",
        },
        glow: {
          // Rose / magenta secondary accent.
          400: "#ff6b9d",
          500: "#ff3d7f",
          600: "#e11d63",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Noto Sans Tamil",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "var(--font-sans)",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(0,0,0,0.7)",
        glow: "0 0 40px -8px rgba(245,145,9,0.45)",
      },
      backgroundImage: {
        "ray-gradient":
          "linear-gradient(120deg, #ffab1f 0%, #f59109 40%, #ff3d7f 100%)",
        "hero-fade":
          "linear-gradient(to top, rgba(7,7,11,1) 0%, rgba(7,7,11,0.6) 40%, rgba(7,7,11,0.1) 75%, rgba(7,7,11,0) 100%)",
        "side-fade":
          "linear-gradient(to right, rgba(7,7,11,0.95) 0%, rgba(7,7,11,0.6) 40%, rgba(7,7,11,0) 100%)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
