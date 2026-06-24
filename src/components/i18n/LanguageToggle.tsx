"use client"

import clsx from "clsx"
import { useSyncExternalStore } from "react"
import { useLanguage } from "@/components/i18n/LanguageProvider"

export function LanguageToggle() {
  const { locale, toggleLocale, t, mounted } = useLanguage()
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!mounted || !hydrated) {
    return (
      <div
        className="h-9 w-[4.25rem] rounded-full bg-muted/50"
        aria-hidden
      />
    )
  }

  const isPt = locale === "pt-BR"

  const handleToggle = () => toggleLocale()

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleToggle()
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      aria-label={isPt ? t.common.languageEn : t.common.languagePt}
      aria-pressed={!isPt}
      tabIndex={0}
      className={clsx(
        "relative inline-flex h-9 w-[4.25rem] shrink-0 items-center rounded-full p-1",
        "border border-border bg-muted/40 transition-colors duration-300",
        "hover:bg-muted/70 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <span
        className={clsx(
          "absolute left-2.5 text-[10px] font-bold uppercase transition-opacity duration-300",
          isPt ? "text-foreground opacity-100" : "text-muted-foreground opacity-35",
        )}
        aria-hidden
      >
        PT
      </span>
      <span
        className={clsx(
          "absolute right-2 text-[10px] font-bold uppercase transition-opacity duration-300",
          !isPt ? "text-foreground opacity-100" : "text-muted-foreground opacity-35",
        )}
        aria-hidden
      >
        EN
      </span>
      <span
        className={clsx(
          "flex h-7 w-7 items-center justify-center rounded-full bg-background text-[10px] font-black shadow-sm",
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isPt ? "translate-x-0" : "translate-x-[1.85rem]",
        )}
      >
        {isPt ? "PT" : "EN"}
      </span>
    </button>
  )
}
