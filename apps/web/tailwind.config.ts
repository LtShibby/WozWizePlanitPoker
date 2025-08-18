import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0B",
        primary: "#00A3FF",
        accent: "#FFD400"
      },
      boxShadow: {
        neon: "0 0 12px rgba(0,163,255,0.5)"
      },
      backgroundImage: {
        // Move the subtle highlight above the viewport and reduce intensity to avoid visible white haze
        scan: "radial-gradient(circle at 50% -25%, rgba(255,255,255,0.02), transparent 35%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};
export default config;
