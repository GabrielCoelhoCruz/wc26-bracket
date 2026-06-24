// ---------------------------------------------------------------------------
// WC26 – Match day navigation helpers
// Smart default day, compact windows, friendly labels
// ---------------------------------------------------------------------------

import type { Match } from "@/types/wc26"
import { formatLocaleDate, type Locale } from "@/lib/i18n"
import { getMessages } from "@/lib/i18n"

export type DayRelativeLabel = "hoje" | "ontem" | "amanha" | null

export type DayScope = "today" | "week" | "all"

/** YYYY-MM-DD in local timezone */
export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Unique sorted match days from a match list */
export function getMatchDays(matches: readonly Match[]): string[] {
  const days = new Set<string>()
  for (const m of matches) days.add(m.date)
  return Array.from(days).sort()
}

export function classifyDay(dateKey: string, now: Date = new Date()): DayRelativeLabel {
  const today = toDateKey(now)
  if (dateKey === today) return "hoje"

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateKey === toDateKey(yesterday)) return "ontem"

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (dateKey === toDateKey(tomorrow)) return "amanha"

  return null
}

export function formatDayLabel(dateKey: string, now: Date = new Date(), locale: Locale = "pt-BR"): string {
  const relative = classifyDay(dateKey, now)
  const m = getMessages(locale).common
  if (relative === "hoje") return m.today
  if (relative === "ontem") return m.yesterday
  if (relative === "amanha") return m.tomorrow

  return formatLocaleDate(dateKey, locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
}

export function formatDayLong(dateKey: string, locale: Locale = "pt-BR"): string {
  return formatLocaleDate(dateKey, locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })
}

/**
 * Pick the best default day:
 * 1) day with live matches
 * 2) today if it has matches
 * 3) next day with scheduled matches
 * 4) last day with finished matches
 * 5) first day in list
 */
export function getSmartDefaultDay(
  matches: readonly Match[],
  now: Date = new Date(),
): string {
  const days = getMatchDays(matches)
  if (days.length === 0) return ""

  const liveDay = matches.find((m) => m.status === "live")?.date
  if (liveDay) return liveDay

  const today = toDateKey(now)
  if (days.includes(today)) return today

  const upcoming = days.find((day) => {
    if (day < today) return false
    return matches.some((m) => m.date === day && m.status === "scheduled")
  })
  if (upcoming) return upcoming

  const finishedDays = days.filter((day) =>
    matches.some((m) => m.date === day && m.status === "finished"),
  )
  if (finishedDays.length > 0) return finishedDays[finishedDays.length - 1]!

  return days[0]!
}

/** Whether smart default suggests by-day view (live or today/upcoming relevance) */
export function shouldDefaultToByDay(
  matches: readonly Match[],
  now: Date = new Date(),
): boolean {
  if (matches.some((m) => m.status === "live")) return true

  const today = toDateKey(now)
  const days = getMatchDays(matches)
  if (!days.includes(today)) {
    const hasUpcoming = days.some(
      (day) =>
        day >= today &&
        matches.some((m) => m.date === day && m.status === "scheduled"),
    )
    return hasUpcoming
  }

  return matches.some(
    (m) =>
      m.date === today &&
      (m.status === "live" || m.status === "scheduled"),
  )
}

/** ±radius days around center that exist in days list */
export function getDayWindow(
  days: readonly string[],
  center: string,
  radius = 3,
): string[] {
  if (days.length === 0) return []
  const idx = days.indexOf(center)
  const centerIdx = idx === -1 ? 0 : idx
  const start = Math.max(0, centerIdx - radius)
  const end = Math.min(days.length - 1, centerIdx + radius)
  return days.slice(start, end + 1)
}

/** Days within scope for period filter */
export function getDaysInScope(
  days: readonly string[],
  scope: DayScope,
  now: Date = new Date(),
): string[] {
  if (scope === "all") return [...days]

  const today = toDateKey(now)

  if (scope === "today") {
    return days.includes(today) ? [today] : []
  }

  const weekEnd = new Date(now)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekEndKey = toDateKey(weekEnd)

  return days.filter((day) => day >= today && day <= weekEndKey)
}

export function getAdjacentDay(
  days: readonly string[],
  current: string,
  direction: "prev" | "next",
): string | null {
  const idx = days.indexOf(current)
  if (idx === -1) return days[0] ?? null
  const nextIdx = direction === "prev" ? idx - 1 : idx + 1
  if (nextIdx < 0 || nextIdx >= days.length) return null
  return days[nextIdx] ?? null
}

export function countMatchesOnDay(matches: readonly Match[], day: string): number {
  return matches.filter((m) => m.date === day).length
}

/** Group matches by time slot for day feed */
export function groupMatchesByTime(matches: readonly Match[]): Map<string, Match[]> {
  const map = new Map<string, Match[]>()
  const sorted = [...matches].sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""))
  for (const m of sorted) {
    const slot = m.time ?? "—"
    const existing = map.get(slot) ?? []
    existing.push(m)
    map.set(slot, existing)
  }
  return map
}
