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
    <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-black tracking-tight text-white transition-colors hover:text-[var(--accent)]"
        >
          <span className="text-xl">⚽</span>
          <span>WC26</span>
          <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] sm:inline-block">
            Bracket + Draft
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                isActive(link.href)
                  ? "text-[var(--accent)]"
                  : "text-[var(--foreground)] hover:text-[var(--accent)]",
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
          className="inline-flex items-center justify-center rounded-lg p-2 text-[var(--foreground)] transition-colors hover:text-[var(--accent)] sm:hidden"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="border-t border-[var(--card-border)] bg-[var(--background)] sm:hidden">
          <nav className="flex flex-col px-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "rounded-lg px-3 py-3 text-sm font-semibold transition-colors",
                  isActive(link.href)
                    ? "text-[var(--accent)]"
                    : "text-[var(--foreground)] hover:text-[var(--accent)]",
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
