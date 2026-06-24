"use client"

import { useLanguage } from "@/components/i18n/LanguageProvider"
import TeamFlag from "@/components/ui/TeamFlag"
import { getTeamName } from "@/lib/i18n"
import type { Team } from "@/types/wc26"
import { RefreshCw } from "lucide-react"

interface NationDiceCardProps {
  nation: Team | null | undefined
  squadSize?: number
  pickableCount?: number
  openPositionName?: string
  rerollsUsed: number
  rerollLimit: number
  canReroll: boolean
  onReroll: () => void
  rolling?: boolean
}

export function NationDiceCard({
  nation,
  squadSize = 26,
  pickableCount,
  openPositionName,
  rerollsUsed,
  rerollLimit,
  canReroll,
  onReroll,
  rolling = false,
}: NationDiceCardProps) {
  const { locale, t } = useLanguage()

  if (!nation) {
    return (
      <div className="draft-seven-roll-idle">
        <p>{t.common.rollingNation}</p>
      </div>
    )
  }

  return (
    <div
      className={`d7-sticker draft-seven-roll-result ${rolling ? "is-spinning" : ""}`}
    >
      <p className="d7-eyebrow">{t.common.nationRolled}</p>

      <div className="d7-rr-sel mt-3">
        <TeamFlag team={nation} size="lg" className="rounded-sm shadow-md" />
        <span>{getTeamName(nation, locale)}</span>
      </div>

      <p className="d7-rr-copa">{t.common.pickFromNation}</p>

      {pickableCount !== undefined && openPositionName && (
        <p className="mt-2 text-[11px] font-semibold text-grass">
          {pickableCount} {t.common.availableFor} {openPositionName} · {squadSize}{" "}
          {t.common.inFullSquad}
        </p>
      )}

      <div className="draft-seven-reroll-box">
        <button
          type="button"
          onClick={onReroll}
          disabled={!canReroll}
          className="d7-btn-secondary w-full text-[clamp(11px,1.9vw,13px)]"
        >
          <RefreshCw size={14} className={rolling ? "animate-spin" : ""} />
          {t.common.rerollNation} ({rerollsUsed}/{rerollLimit})
        </button>
      </div>
    </div>
  )
}
