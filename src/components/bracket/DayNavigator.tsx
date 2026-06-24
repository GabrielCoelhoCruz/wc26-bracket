"use client"

import {
  classifyDay,
  countMatchesOnDay,
  formatDayLabel,
  formatDayLong,
  getAdjacentDay,
  getDayWindow,
  getDaysInScope,
  getSmartDefaultDay,
  toDateKey,
  type DayScope,
} from "@/lib/match-day-nav"
import StadiumPanel from "@/components/ui/StadiumPanel"
import {
  STADIUM_EASE,
  chipDayActive,
  chipDayInactive,
  chipPrimaryActive,
  chipPrimaryInactive,
  chipTodayHighlight,
} from "@/lib/stadium-ui"
import { useLanguage } from "@/components/i18n/LanguageProvider"
import type { Match } from "@/types/wc26"

interface DayNavigatorProps {
  matches: readonly Match[]
  allDays: readonly string[]
  selectedDay: string
  onDayChange: (day: string) => void
  scope: DayScope
  onScopeChange: (scope: DayScope) => void
}

export default function DayNavigator({
  matches,
  allDays,
  selectedDay,
  onDayChange,
  scope,
  onScopeChange,
}: DayNavigatorProps) {
  const { locale, t } = useLanguage()
  const now = new Date()
  const todayKey = toDateKey(now)
  const smartDay = getSmartDefaultDay(matches, now)
  const scopeDays = getDaysInScope(allDays, scope, now)
  const navigableDays = scopeDays.length > 0 ? scopeDays : allDays

  const activeDay = navigableDays.includes(selectedDay)
    ? selectedDay
    : (navigableDays[0] ?? selectedDay)

  const windowDays = getDayWindow(navigableDays, activeDay, 3)
  const matchCount = countMatchesOnDay(matches, activeDay)
  const prevDay = getAdjacentDay(navigableDays, activeDay, "prev")
  const nextDay = getAdjacentDay(navigableDays, activeDay, "next")
  const showTodayChip = allDays.includes(todayKey)

  const isTodaySelected =
    activeDay === todayKey || (activeDay === smartDay && !allDays.includes(todayKey))

  const handleScopeChange = (next: DayScope) => {
    onScopeChange(next)
    const scoped = getDaysInScope(allDays, next, now)
    const days = scoped.length > 0 ? scoped : allDays
    if (next === "today") {
      const today = days.find((d) => classifyDay(d, now) === "hoje")
      if (today) onDayChange(today)
      else if (days[0]) onDayChange(days[0])
    } else if (!days.includes(activeDay) && days[0]) {
      onDayChange(getSmartDefaultDay(matches, now))
    }
  }

  return (
    <StadiumPanel className="p-4">
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {(
          [
            ["today", t.common.today],
            ["week", t.common.thisWeek],
            ["all", t.common.all],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleScopeChange(key)}
            className={`rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${STADIUM_EASE} ${
              scope === key ? chipPrimaryActive : chipPrimaryInactive
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => prevDay && onDayChange(prevDay)}
          disabled={!prevDay}
          aria-label={t.common.prevDay}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted/50 text-lg font-light text-foreground ${STADIUM_EASE} hover:border-grass/40 hover:bg-muted disabled:opacity-30 active:scale-[0.96]`}
        >
          ‹
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            {classifyDay(activeDay, now) === "hoje" ? t.common.todayAtCup : t.common.matchDay}
          </p>
          <p className="truncate text-lg font-bold text-foreground">
            {formatDayLong(activeDay, locale)}
          </p>
          <p className="text-xs text-muted-foreground">
            {matchCount} {matchCount !== 1 ? t.common.matches : t.common.match}
          </p>
        </div>

        <button
          type="button"
          onClick={() => nextDay && onDayChange(nextDay)}
          disabled={!nextDay}
          aria-label={t.common.nextDay}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted/50 text-lg font-light text-foreground ${STADIUM_EASE} hover:border-grass/40 hover:bg-muted disabled:opacity-30 active:scale-[0.96]`}
        >
          ›
        </button>
      </div>

      <div className="day-nav-fade mt-4 flex gap-2 overflow-x-auto pb-1">
        {showTodayChip && (
          <button
            type="button"
            onClick={() => onDayChange(allDays.includes(todayKey) ? todayKey : smartDay)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${STADIUM_EASE} ${
              isTodaySelected ? chipDayActive : chipTodayHighlight
            }`}
          >
            {t.common.today}
          </button>
        )}
        {windowDays.map((day) => {
          if (showTodayChip && day === todayKey && classifyDay(day, now) === "hoje") {
            return null
          }
          return (
            <button
              key={day}
              type="button"
              onClick={() => onDayChange(day)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${STADIUM_EASE} ${
                activeDay === day ? chipDayActive : chipDayInactive
              }`}
            >
              {formatDayLabel(day, now, locale)}
              <span className="ml-1 opacity-70">
                {countMatchesOnDay(matches, day)}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-col items-center justify-center gap-2 border-t border-border/50 pt-4 sm:flex-row">
        <label
          htmlFor="day-calendar-select"
          className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
        >
          {t.common.viewCalendar}
        </label>
        <select
          id="day-calendar-select"
          value={activeDay}
          onChange={(e) => onDayChange(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-border bg-input px-3 py-2 text-xs font-medium text-foreground focus:border-accent focus:outline-none sm:w-auto"
        >
          {allDays.map((day) => (
            <option key={day} value={day}>
              {formatDayLabel(day, now, locale)} — {countMatchesOnDay(matches, day)} {t.common.games}
            </option>
          ))}
        </select>
      </div>
    </StadiumPanel>
  )
}
