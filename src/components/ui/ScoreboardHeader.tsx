"use client"

import TeamFlag from "@/components/ui/TeamFlag"
import { useLanguage } from "@/components/i18n/LanguageProvider"
import { getTeam } from "@/data/teams"
import { formatMessage, getTeamName } from "@/lib/i18n"
import type { TeamCode } from "@/types/wc26"

interface ScoreboardHeaderProps {
  homeTeam: TeamCode
  awayTeam: TeamCode
  homeScore: number
  awayScore: number
  label?: string
  showFullNames?: boolean
  compact?: boolean
  className?: string
}

export default function ScoreboardHeader({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  label,
  showFullNames = true,
  compact = false,
  className = "",
}: ScoreboardHeaderProps) {
  const { locale, t } = useLanguage()
  const home = getTeam(homeTeam)
  const away = getTeam(awayTeam)

  const homeName = showFullNames ? getTeamName(home, locale) || homeTeam : (home?.code ?? homeTeam)
  const awayName = showFullNames ? getTeamName(away, locale) || awayTeam : (away?.code ?? awayTeam)

  return (
    <div
      className={`
        rounded-xl border border-grass/40 bg-tunnel-dark shadow-[inset_0_0_24px_color-mix(in_srgb,var(--led)_8%,transparent)]
        ${compact ? "px-3 py-2" : "px-4 py-3"}
        ${className}
      `}
      role="status"
      aria-label={formatMessage(t.common.scoreboard, {
        home: homeName,
        homeScore,
        awayScore,
        away: awayName,
      })}
    >
      {label && (
        <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-led">
          {label}
        </p>
      )}
      <div
        className={`font-scoreboard flex items-center justify-center font-black ${
          compact ? "gap-2 text-base" : "gap-3 text-lg sm:gap-4 sm:text-xl"
        }`}
      >
        <span className={`flex items-center gap-2 ${compact ? "max-w-[38%]" : "max-w-[40%]"}`}>
          {home && <TeamFlag team={home} size={compact ? "xs" : "sm"} />}
          <span className="truncate uppercase">{homeName}</span>
        </span>
        <span className={`text-led shrink-0 ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}>
          {homeScore}
          <span className="mx-1.5 text-muted-foreground sm:mx-2">-</span>
          {awayScore}
        </span>
        <span className={`flex items-center justify-end gap-2 ${compact ? "max-w-[38%]" : "max-w-[40%]"}`}>
          <span className="truncate uppercase">{awayName}</span>
          {away && <TeamFlag team={away} size={compact ? "xs" : "sm"} />}
        </span>
      </div>
    </div>
  )
}
