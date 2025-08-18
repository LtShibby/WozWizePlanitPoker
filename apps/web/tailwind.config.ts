import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0B",
        primary: "#00A3FF",
        accent: "#FFD400"
      },
      fontFamily: {
        'heading': ['Space Grotesk', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        scan: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03), transparent 30%), linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px)"
      },
      boxShadow: {
        neon: "0 0 12px rgba(0,163,255,0.5)"
      }
    },
  },
  plugins: [],
} satisfies Config;
