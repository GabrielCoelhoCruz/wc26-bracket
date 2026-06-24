"use client"

import { useEffect } from "react"
import { useLanguage } from "@/components/i18n/LanguageProvider"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const { t } = useLanguage()

  useEffect(() => {
    console.error("[app] unhandled error", error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-danger">
        {t.pages.error.badge}
      </p>
      <h1 className="font-scoreboard mb-4 text-4xl font-black text-foreground sm:text-5xl">
        {t.pages.error.title}
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        {t.pages.error.body}
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-bold text-background transition hover:brightness-110"
      >
        {t.pages.error.retry}
      </button>
    </div>
  )
}
