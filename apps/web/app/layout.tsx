import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "WozWize PlanIt Poker",
  description: "Ephemeral planning poker with emoji chaos. No database, no problem."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="fixed bottom-2 right-3 text-xs opacity-40 select-none">WOZWIZE</div>
        {children}
      </body>
    </html>
  );
}
