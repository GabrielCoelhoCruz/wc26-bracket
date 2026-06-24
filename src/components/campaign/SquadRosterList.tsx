"use client"

import { useLanguage } from "@/components/i18n/LanguageProvider"
import { getPositionAbbrev } from "@/lib/i18n"
import type { Player } from "@/types/wc26"

interface SquadRosterListProps {
  players: Player[]
  hideRating?: boolean
  canPick?: (player: Player) => boolean
  onPick?: (player: Player) => void
  openPositionName?: string
  filledCount?: number
  totalSlots?: number
}

export function SquadRosterList({
  players,
  hideRating = false,
  canPick,
  onPick,
  openPositionName,
  filledCount = 0,
  totalSlots = 11,
}: SquadRosterListProps) {
  const { t, locale, format } = useLanguage()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="draft-seven-pool-head">
        <span className="d7-eyebrow">
          {openPositionName
            ? format(t.common.pickForPosition, { position: openPositionName })
            : t.common.fullSquad}
        </span>
        <span className="d7-eyebrow d7-num">
          {filledCount}/{totalSlots}
        </span>
      </div>

      <div className="draft-seven-pool">
        {players.map((player) => {
          const pickable = canPick?.(player) ?? false
          return (
            <button
              key={player.id}
              type="button"
              disabled={!pickable}
              onClick={pickable && onPick ? () => onPick(player) : undefined}
              className={`draft-seven-pool-row ${!pickable ? "is-disabled" : ""}`}
            >
              <span className="d7-pool-num">{player.shirtNumber ?? "–"}</span>
              <span className="d7-pool-pos" title={player.position}>
                {getPositionAbbrev(player.position, locale)}
              </span>
              <span className="d7-pool-name">{player.name}</span>
              {!hideRating && (
                <span className="d7-pool-force">{player.rating}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
