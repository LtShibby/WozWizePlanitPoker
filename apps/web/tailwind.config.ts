import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Space Grotesk', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        scan: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03), transparent 30%), linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px)"
      }
    },
  },
  plugins: [],
} satisfies Config;
