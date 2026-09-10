import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        // Smart-TV / large-display tier — used to scale up type, spacing and grids.
        tv: "1920px",
      },
      colors: {
        // Deep "arcade" blue-black canvas.
        ink: {
          950: "#02060f",
          900: "#040b1c",
          850: "#061229",
          800: "#0a1a3a",
          700: "#0f244f",
          600: "#173368",
          500: "#244a90",
        },
        // Arcade blue — electric secondary accent.
        arcade: {
          50: "#eaf2ff",
          100: "#cfe0ff",
          200: "#a3c4ff",
          300: "#6fa4ff",
          400: "#3d84ff",
          500: "#1f6bff",
          600: "#0a4fe0",
          700: "#093db0",
        },
        // Shining gold — primary premium accent (mapped to `ray` so all existing
        // accent usages become gold).
        ray: {
          50: "#fffae8",
          100: "#fff1bf",
          200: "#ffe58a",
          300: "#ffd75e",
          400: "#ffc933",
          500: "#f5b60c",
          600: "#d99406",
          700: "#b4770a",
        },
        // Legacy secondary token now points at arcade blue.
        glow: {
          400: "#3d84ff",
          500: "#1f6bff",
          600: "#0a4fe0",
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
        card: "0 12px 34px -14px rgba(0,0,0,0.85)",
        glow: "0 0 42px -8px rgba(245,182,12,0.55)",
        "glow-blue": "0 0 42px -8px rgba(31,107,255,0.6)",
        premium:
          "0 1px 0 0 rgba(255,215,94,0.35) inset, 0 20px 50px -20px rgba(31,107,255,0.45)",
      },
      backgroundImage: {
        // Shining-gold primary gradient (buttons, accents, wordmark).
        "ray-gradient":
          "linear-gradient(120deg, #ffe58a 0%, #ffc933 45%, #d99406 100%)",
        // Arcade blue -> gold, for brand flourishes, hero rings, the intro.
        "arcade-gradient":
          "linear-gradient(120deg, #0a4fe0 0%, #1f6bff 42%, #ffd75e 100%)",
        // Gold shine sweep used for text/logo highlights.
        "gold-shine":
          "linear-gradient(100deg, #b4770a 0%, #ffe58a 20%, #fff6d6 30%, #ffe58a 40%, #d99406 60%, #ffe58a 100%)",
        "hero-fade":
          "linear-gradient(to top, rgba(10,15,30,1) 0%, rgba(10,15,30,0.55) 42%, rgba(10,15,30,0.08) 78%, rgba(10,15,30,0) 100%)",
        "side-fade":
          "linear-gradient(to right, rgba(10,15,30,0.9) 0%, rgba(10,15,30,0.45) 42%, rgba(10,15,30,0) 100%)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        // Premium heartbeat for the brand mark.
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "8%": { transform: "scale(1.12)" },
          "16%": { transform: "scale(1)" },
          "24%": { transform: "scale(1.08)" },
          "32%": { transform: "scale(1)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "80%, 100%": { transform: "scale(2.4)", opacity: "0" },
        },
        "gold-sweep": {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        // Intro sequence pieces.
        "intro-rays": {
          "0%": { opacity: "0", transform: "scale(0.6) rotate(-25deg)" },
          "40%": { opacity: "0.9" },
          "100%": { opacity: "0", transform: "scale(1.6) rotate(20deg)" },
        },
        "intro-mark": {
          "0%": { opacity: "0", transform: "scale(0.4)", filter: "blur(12px)" },
          "45%": { opacity: "1", transform: "scale(1.06)", filter: "blur(0)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "intro-word": {
          "0%": { opacity: "0", transform: "translateY(18px)", letterSpacing: "0.4em" },
          "100%": { opacity: "1", transform: "translateY(0)", letterSpacing: "normal" },
        },
        "intro-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0", visibility: "hidden" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        shimmer: "shimmer 1.6s infinite",
        heartbeat: "heartbeat 2.4s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
        "gold-sweep": "gold-sweep 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
