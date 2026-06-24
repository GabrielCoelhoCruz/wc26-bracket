"use client"

import type { Player } from "@/types/wc26"
import PlayerCard from "@/components/draft/PlayerCard"
import { useLanguage } from "@/components/i18n/LanguageProvider"

interface DraftBenchProps {
  players: Player[]
  title?: string
  hideRatings?: boolean
  className?: string
}

export default function DraftBench({
  players,
  title,
  hideRatings = false,
  className = "",
}: DraftBenchProps) {
  const { t } = useLanguage()
  const heading = title ?? t.common.bench

  if (players.length === 0) return null

  return (
    <div className={`rounded-xl border border-border bg-card/40 p-4 ${className}`}>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {heading} ({players.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {players.map((player) => (
          <div key={player.id} className="w-full sm:w-[calc(50%-4px)]">
            <PlayerCard player={player} hideRating={hideRatings} />
          </div>
        ))}
      </div>
    </div>
  )
}
