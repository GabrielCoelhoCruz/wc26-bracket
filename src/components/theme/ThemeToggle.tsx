"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import clsx from "clsx"
import { useLanguage } from "@/components/i18n/LanguageProvider"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const { t } = useLanguage()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!mounted) {
    return (
      <div
        className="h-9 w-[4.25rem] rounded-full bg-muted/50"
        aria-hidden
      />
    )
  }

  const isDark = resolvedTheme === "dark"

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark")
  }

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
      aria-label={isDark ? t.common.themeLight : t.common.themeDark}
      aria-pressed={isDark}
      tabIndex={0}
      className={clsx(
        "relative inline-flex h-9 w-[4.25rem] shrink-0 items-center rounded-full p-1",
        "border border-border bg-muted/40 transition-colors duration-300",
        "hover:bg-muted/70 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <Sun
        size={13}
        strokeWidth={2}
        className={clsx(
          "absolute left-2.5 text-muted-foreground transition-opacity duration-300",
          isDark ? "opacity-35" : "opacity-0",
        )}
        aria-hidden
      />
      <Moon
        size={13}
        strokeWidth={2}
        className={clsx(
          "absolute right-2.5 text-muted-foreground transition-opacity duration-300",
          isDark ? "opacity-0" : "opacity-35",
        )}
        aria-hidden
      />
      <span
        className={clsx(
          "flex h-7 w-7 items-center justify-center rounded-full bg-background shadow-sm",
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isDark ? "translate-x-[1.85rem]" : "translate-x-0",
        )}
      >
        {isDark ? (
          <Moon size={14} className="text-accent" strokeWidth={2.25} aria-hidden />
        ) : (
          <Sun size={14} className="text-accent" strokeWidth={2.25} aria-hidden />
        )}
      </span>
    </button>
  )
}
