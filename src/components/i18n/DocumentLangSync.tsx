"use client"

import { useEffect } from "react"
import { useLanguage } from "@/components/i18n/LanguageProvider"
import { parseShareLangParam } from "@/lib/i18n"

export function DocumentLangSync() {
  const { locale, setLocale, t } = useLanguage()

  useEffect(() => {
    const lang = new URLSearchParams(window.location.search).get("lang")
    if (lang) {
      setLocale(parseShareLangParam(lang))
    }
  }, [setLocale])

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = t.metadata.title
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute("content", t.metadata.description)
    }
  }, [locale, t])

  return null
}
