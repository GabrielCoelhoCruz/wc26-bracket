"use client"

import { NationDiceCard } from "@/components/campaign/NationDiceCard"
import { SquadRosterList } from "@/components/campaign/SquadRosterList"
import { useLanguage } from "@/components/i18n/LanguageProvider"
import {
  getOpenPositionAbbrev,
  getOpenPositionName,
} from "@/lib/draft-nation-roll"
import type { NationDraftState } from "@/lib/draft-nation-roll"
import type { Team } from "@/types/wc26"
import type { DraftMode, Player } from "@/types/wc26"

interface DraftRollPanelProps {
  draft: NationDraftState
  draftMode: DraftMode
  nation: Team | null | undefined
  pickableCount: number
  hideRatings: boolean
  rolling: boolean
  canReroll: boolean
  onReroll: () => void
  onPick: (player: Player) => void
  canPick: (player: Player) => boolean
  squadPlayers: Player[]
  filledCount: number
  totalSlots: number
}

export function DraftRollPanel({
  draft,
  draftMode,
  nation,
  pickableCount,
  hideRatings,
  rolling,
  canReroll,
  onReroll,
  onPick,
  canPick,
  squadPlayers,
  filledCount,
  totalSlots,
}: DraftRollPanelProps) {
  const { t, locale } = useLanguage()
  const current = draft.draftRounds[draft.round]

  return (
    <div className="draft-seven-roll-panel">
      <NationDiceCard
        nation={nation}
        squadSize={squadPlayers.length}
        pickableCount={pickableCount}
        openPositionName={
          current ? getOpenPositionName(draft, locale) : undefined
        }
        rerollsUsed={current?.rerollsUsed ?? 0}
        rerollLimit={draftMode === "classic" ? 3 : 1}
        canReroll={canReroll}
        onReroll={onReroll}
        rolling={rolling}
      />

      {pickableCount === 0 && (
        <p className="rounded-sm border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-800 dark:text-amber-200">
          {t.common.noPlayerPosition}
        </p>
      )}

      <SquadRosterList
        players={squadPlayers}
        hideRating={hideRatings}
        canPick={canPick}
        onPick={onPick}
        openPositionName={current ? getOpenPositionAbbrev(draft, locale) : undefined}
        filledCount={filledCount}
        totalSlots={totalSlots}
      />
    </div>
  )
}
