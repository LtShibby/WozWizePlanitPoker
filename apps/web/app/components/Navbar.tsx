"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

function NavLink({ href, label, isActive, onClick }: { href: string; label: string; isActive: boolean; onClick?: () => void }) {
  const base = "px-3 py-2 rounded-md text-sm transition-colors";
  const active = isActive ? "font-semibold border-b-2 border-blue-500" : "";
  return (
    <Link href={href} onClick={onClick} className={`${base} ${active} hover:text-white`}>
      {label}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Basic focus trap for mobile menu
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = menuRef.current?.querySelectorAll<HTMLElement>('a, button');
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    // Close on route change
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const focusable = menuRef.current?.querySelectorAll<HTMLElement>('a, button');
    focusable?.[0]?.focus();
  }, [open]);

  const links = [
    { href: "/", label: "Home" },
    { href: "/create", label: "Create Room" },
    { href: "/join", label: "Join Room" },
    { href: "/about", label: "About Us" }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#121821] bg-[#0b0f14] text-[#e6e6e6] shadow-[0_1px_0_rgba(0,0,0,0.1)]">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
        <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
          <Image src="/images/wozwize-owl.png" alt="WozWize" width={50} height={50} />
          <span className="sr-only">Home</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2" role="navigation" aria-label="Primary">
          {links.map(l => (
            <NavLink key={l.href} href={l.href} label={l.label} isActive={pathname === l.href} />
          ))}
        </nav>

        <button
          ref={buttonRef}
          className="md:hidden inline-flex items-center justify-center rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(v => !v)}
        >
          <span className="block w-5 h-0.5 bg-current mb-1"></span>
          <span className="block w-5 h-0.5 bg-current mb-1"></span>
          <span className="block w-5 h-0.5 bg-current"></span>
        </button>
      </div>

      <div
        id="mobile-nav"
        ref={menuRef}
        className={`md:hidden border-t border-[#121821] bg-[#0b0f14] overflow-hidden transition-[max-height] duration-300 ease-out ${open ? "max-h-96" : "max-h-0"}`}
        aria-hidden={!open}
      >
        <div className="px-4 py-2 flex flex-col" role="navigation" aria-label="Mobile">
          {links.map(l => (
            <NavLink key={l.href} href={l.href} label={l.label} isActive={pathname === l.href} onClick={() => setOpen(false)} />
          ))}
        </div>
      </div>
    </header>
  );
}


