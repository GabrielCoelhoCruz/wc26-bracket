"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Bracket", href: "/bracket" },
  { label: "Draft", href: "/draft" },
  { label: "Ranking", href: "/ranking" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-[#0f0f0f]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo — 7a0 style minimal */}
        <Link
          href="/"
          className="text-lg font-black tracking-tight text-white hover:text-zinc-300 transition-colors"
        >
          WC26
        </Link>

        {/* Desktop nav — subtle hover/active */}
        <nav className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                isActive(link.href)
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-400 hover:text-white transition-colors sm:hidden"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="border-t border-zinc-800/60 bg-[#0f0f0f] sm:hidden">
          <nav className="flex flex-col px-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "rounded-lg px-3 py-3 text-sm font-semibold transition-colors",
                  isActive(link.href)
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
