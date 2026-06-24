"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import {
  defaultLocale,
  formatMessage,
  getMessages,
  isLocale,
  localeStorageKey,
  type Locale,
  type Messages,
} from "@/lib/i18n"

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: Messages
  format: typeof formatMessage
  mounted: boolean
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const localeListeners = new Set<() => void>()

function subscribeLocale(onStoreChange: () => void) {
  localeListeners.add(onStoreChange)
  return () => {
    localeListeners.delete(onStoreChange)
  }
}

function emitLocaleChange() {
  localeListeners.forEach((listener) => listener())
}

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale
  try {
    const stored = localStorage.getItem(localeStorageKey)
    if (stored && isLocale(stored)) return stored
  } catch {
    // ignore
  }
  return defaultLocale
}

function persistLocale(locale: Locale) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale
  }
  try {
    localStorage.setItem(localeStorageKey, locale)
  } catch {
    // ignore
  }
  emitLocaleChange()
}

const subscribeNoop = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function LanguageProvider({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  )

  const locale = useSyncExternalStore(
    subscribeLocale,
    readStoredLocale,
    () => defaultLocale,
  )

  const setLocale = useCallback((next: Locale) => {
    persistLocale(next)
  }, [])

  const toggleLocale = useCallback(() => {
    const next = locale === "pt-BR" ? "en-US" : "pt-BR"
    persistLocale(next)
  }, [locale])

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: getMessages(locale),
      format: formatMessage,
      mounted,
    }),
    [locale, setLocale, toggleLocale, mounted],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return ctx
}
