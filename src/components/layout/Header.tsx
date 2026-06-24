"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import clsx from "clsx"
import { LanguageToggle } from "@/components/i18n/LanguageToggle"
import { useLanguage } from "@/components/i18n/LanguageProvider"
import { ThemeToggle } from "@/components/theme/ThemeToggle"

export default function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useLanguage()

  const navLinks = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.bracket, href: "/bracket" },
    { label: t.nav.draft, href: "/draft" },
    { label: t.nav.ranking, href: "/ranking" },
    { label: t.nav.bolao, href: "/bolao" },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const handleMobileToggle = () => setMobileOpen((open) => !open)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-[var(--header-bg)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-lg font-black tracking-tight text-foreground transition-colors hover:text-muted-foreground"
        >
          WC26
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                isActive(link.href)
                  ? "bg-accent-soft text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <ThemeToggle />

          <button
            type="button"
            onClick={handleMobileToggle}
            aria-label={t.nav.openMenu}
            aria-expanded={mobileOpen}
            className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground sm:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/60 bg-[var(--header-bg)] backdrop-blur-xl sm:hidden">
          <nav className="flex flex-col px-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "rounded-lg px-3 py-3 text-sm font-semibold transition-colors",
                  isActive(link.href)
                    ? "bg-accent-soft text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
