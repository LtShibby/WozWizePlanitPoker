import "./globals.css";
import type { ReactNode } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
const Navbar = dynamic(() => import("./components/Navbar"), { ssr: false });

export const metadata = {
  title: "WozWize PlanIt Poker",
  description: "Ephemeral planning poker with emoji chaos. No database, no problem.",
  icons: {
    icon: "/images/wozwize-owl.png"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <footer className="w-full border-t border-[#222] bg-[#111] text-[#aaa]">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-center gap-2">
            <Image src="/images/wozwize-owl.png" alt="WozWize Owl" width={24} height={24} />
            <span>
              Planit Poker is a <a href="https://wozwize.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">WozWize</a> product.
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
