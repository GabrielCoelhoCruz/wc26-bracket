"use client"

import Link from "next/link"
import { useLanguage } from "@/components/i18n/LanguageProvider"

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-gold">
        {t.pages.notFound.badge}
      </p>
      <h1 className="font-scoreboard mb-4 text-5xl font-black text-foreground sm:text-6xl">
        {t.pages.notFound.title}
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        {t.pages.notFound.body}
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-bold text-background transition hover:brightness-110"
      >
        {t.pages.notFound.home}
      </Link>
    </div>
  )
}
