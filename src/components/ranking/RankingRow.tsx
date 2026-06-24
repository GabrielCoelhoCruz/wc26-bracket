"use client"

import { Trash2 } from "lucide-react"
import { useLanguage } from "@/components/i18n/LanguageProvider"
import type { RankingEntry } from "@/lib/local-ranking"

interface RankingRowProps {
  entry: RankingEntry
  rank: number
  medal?: string
  onRemove?: (id: string) => void
}

export default function RankingRow({
  entry,
  rank,
  medal,
  onRemove,
}: RankingRowProps) {
  const { t } = useLanguage()
  const displayRank = medal ?? `#${rank}`
  const predictionCount = Object.keys(entry.predictions).length
  const winnerCount = entry.breakdown?.breakdown.filter((b) => b.winnerCorrect).length ?? 0
  const exactCount = entry.breakdown?.breakdown.filter((b) => b.scoreExact).length ?? 0

  return (
    <div className="flex items-center gap-4 rounded-xl border border-grass/20 bg-pitch-card px-5 py-4">
      <span className="font-scoreboard w-8 text-lg font-black text-gold">
        {displayRank}
      </span>
      <div className="flex-1 text-left">
        <div className="font-bold text-foreground">{entry.name}</div>
        <div className="text-xs text-muted-foreground">
          {predictionCount} {t.common.predictions}
          {entry.importedFrom && ` · ${t.common.imported}`}
          {entry.breakdown && (
            <span className="ml-1 text-grass">
              · {winnerCount} {t.ranking.winners}
              {exactCount > 0 && ` · ${exactCount} ${t.ranking.exactScores}`}
            </span>
          )}
        </div>
      </div>
      <div className="font-scoreboard text-xl font-black text-led">{entry.score}</div>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          className="rounded p-1.5 text-muted-foreground transition hover:text-danger"
          aria-label={`${t.common.remove} ${entry.name}`}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  )
}
