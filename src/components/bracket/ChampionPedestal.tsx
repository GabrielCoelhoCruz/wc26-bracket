"use client"

import { Trophy } from "lucide-react"
import { useLanguage } from "@/components/i18n/LanguageProvider"
import { getTeam } from "@/data/teams"
import TeamFlag from "@/components/ui/TeamFlag"
import { getTeamName } from "@/lib/i18n"
import type { TeamCode } from "@/types/wc26"

interface ChampionPedestalProps {
  winnerCode?: TeamCode | null
  compact?: boolean
}

export default function ChampionPedestal({
  winnerCode,
  compact = false,
}: ChampionPedestalProps) {
  const { locale, t } = useLanguage()
  const team = winnerCode ? getTeam(winnerCode) : null

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-2xl border border-accent/30 bg-gradient-to-b from-accent-soft/80 to-card/40 text-center ${
        compact ? "px-4 py-5" : "px-6 py-8"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, var(--accent) 25%, transparent), transparent)",
        }}
        aria-hidden
      />
      <div className="relative flex flex-col items-center gap-2">
        <Trophy
          size={compact ? 28 : 36}
          className="text-accent drop-shadow-[0_0_12px_color-mix(in_srgb,var(--accent)_50%,transparent)]"
          aria-hidden
        />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          {t.common.champion}
        </span>
        {team ? (
          <>
            <TeamFlag team={team} size={compact ? "md" : "lg"} />
            <p className={`font-bold text-foreground ${compact ? "text-sm" : "text-base"}`}>
              {getTeamName(team, locale)}
            </p>
            <span className="text-[10px] uppercase text-muted-foreground">{team.code}</span>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t.bracket.championHere}</p>
        )}
      </div>
    </div>
  )
}
