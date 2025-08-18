"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Route } from "next";

type NavLinkProps = {
  href: Route;
  label: string;
  isActive: boolean;
  onClick?: () => void;
};

function NavLink({ href, label, isActive, onClick }: NavLinkProps) {
  return (
    <Link href={href} onClick={onClick} className="relative px-3 py-2 text-sm transition-colors hover:text-white group">
      {label}
      {isActive && (
        <motion.div
          layoutId="navbar-underline"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500/30"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.2 }}
        style={{ transformOrigin: "left" }}
      />
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navbarRef = useRef<HTMLDivElement | null>(null);
  
  const { scrollY } = useScroll();
  const navbarHeight = useTransform(scrollY, [0, 100], [56, 48]); // 56px to 48px
  const navbarOpacity = useTransform(scrollY, [0, 50], [0.95, 0.98]);
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.9]);

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
    { href: "/" as Route, label: "Home" },
    { href: "/create" as Route, label: "Create Room" },
    { href: "/join" as Route, label: "Join Room" },
    { href: "/about" as Route, label: "About Us" }
  ] satisfies ReadonlyArray<{ href: Route; label: string }>;

  return (
    <motion.header
      ref={navbarRef}
      style={{ height: navbarHeight, opacity: navbarOpacity }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10 shadow-2xl"
    >
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-full">
        <Link href="/" className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-transform hover:scale-105">
          <motion.div style={{ scale: logoScale }}>
            <Image src="/images/wozwize-owl.png" alt="WozWize" width={50} height={50} />
          </motion.div>
          <span className="font-bold text-lg tracking-wide font-heading bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            WOZWIZE PLANIT POKER
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Primary">
          {links.map(l => (
            <NavLink key={l.href} href={l.href} label={l.label} isActive={pathname === l.href} />
          ))}
          <motion.div
            className="ml-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/create" 
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:from-blue-500 hover:to-blue-400"
            >
              Get Started
            </Link>
          </motion.div>
        </nav>

        <button
          ref={buttonRef}
          className="md:hidden inline-flex items-center justify-center rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors hover:bg-white/10"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(v => !v)}
        >
          <motion.div
            animate={open ? "open" : "closed"}
            className="flex flex-col items-center justify-center w-5 h-5"
          >
            <motion.span
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: 45, y: 6 }
              }}
              className="block w-5 h-0.5 bg-current mb-1 origin-center"
            />
            <motion.span
              variants={{
                closed: { opacity: 1 },
                open: { opacity: 0 }
              }}
              className="block w-5 h-0.5 bg-current mb-1"
            />
            <motion.span
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: -45, y: -6 }
              }}
              className="block w-5 h-0.5 bg-current origin-center"
            />
          </motion.div>
        </button>
      </div>

      <motion.div
        id="mobile-nav"
        ref={menuRef}
        className="md:hidden border-t border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden"
        initial={{ height: 0 }}
        animate={{ height: open ? "auto" : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        aria-hidden={!open}
      >
        <div className="px-4 py-2 flex flex-col space-y-1" role="navigation" aria-label="Mobile">
          {links.map(l => (
            <NavLink key={l.href} href={l.href} label={l.label} isActive={pathname === l.href} onClick={() => setOpen(false)} />
          ))}
          <div className="pt-2">
            <Link 
              href="/create" 
              className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium text-center shadow-lg"
              onClick={() => setOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
}


