"use client"

import { useLanguage } from "@/components/i18n/LanguageProvider"

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-border/60 bg-background px-4 py-6 text-center">
      <p className="text-sm text-muted-foreground">{t.footer.built}</p>
      <p className="mt-1 text-xs text-muted-foreground/80">{t.footer.madeIn}</p>
    </footer>
  )
}
