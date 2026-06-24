"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/components/i18n/LanguageProvider"
import { DraftBoxScore } from "@/components/campaign/DraftBoxScore"
import { DraftRollPanel } from "@/components/campaign/DraftRollPanel"
import { DraftPitch } from "@/components/draft/DraftPitch"
import DraftTimer from "@/components/draft/DraftTimer"
import { getTeam } from "@/data/teams"
import { getPositionEmoji } from "@/lib/draft"
import {
  buildPartialDraftTeam,
  canPickPlayer,
  canReroll,
  getFormationSlotProgress,
  getNationDraftRounds,
  getOpenPosition,
  type NationDraftState,
} from "@/lib/draft-nation-roll"
import type { DraftMode, Player } from "@/types/wc26"
import type { FormationId } from "@/lib/formations"

interface NationDraftBoardProps {
  draft: NationDraftState
  draftMode: DraftMode
  onPick: (player: Player) => void
  onReroll: () => void
}

export function NationDraftBoard({
  draft,
  draftMode,
  onPick,
  onReroll,
}: NationDraftBoardProps) {
  const { t } = useLanguage()
  const [rolling, setRolling] = useState(false)
  const total = getNationDraftRounds(draft)
  const current = draft.draftRounds[draft.round]
  const nation = current ? getTeam(current.rolledNation) : null
  const hideRatings = draftMode === "almanaque" && !draft.completed
  const openPosition = getOpenPosition(draft)
  const partialTeam = buildPartialDraftTeam(draft)
  const slotProgress = getFormationSlotProgress(draft)
  const pickableCount = current?.options.filter((p) => canPickPlayer(draft, p)).length ?? 0
  const roundCurrent = Math.min(draft.round + 1, total)

  useEffect(() => {
    if (!rolling) return
    const timer = setTimeout(() => setRolling(false), 520)
    return () => clearTimeout(timer)
  }, [rolling, current?.rolledNation])

  const handleReroll = () => {
    setRolling(true)
    onReroll()
  }

  return (
    <div className="draft-seven-root w-full">
      <header className="draft-seven-header">
        <div>
          <p className="d7-eyebrow">{t.common.liveDraft}</p>
          <p className="text-sm font-extrabold">
            {t.common.round} {roundCurrent}/{total}
          </p>
        </div>
        <div className="ml-auto">
          <DraftTimer
            seconds={90}
            running={!draft.completed}
            label={t.common.roundTime}
            variant="seven"
          />
        </div>
      </header>

      <div className="draft-seven-slot-pills px-4 pt-3">
        {slotProgress.map((slot, i) => (
          <span
            key={`${slot.position}-${i}`}
            title={slot.player?.name ?? slot.position}
            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-1.5 text-[10px] font-bold transition ${
              slot.current
                ? "border-gold bg-gold/20 text-gold glow-gold"
                : slot.filled
                  ? "border-grass/50 bg-grass/15 text-foreground"
                  : "border-border bg-muted/30 text-muted-foreground"
            }`}
          >
            {slot.filled ? getPositionEmoji(slot.position) : slot.position}
          </span>
        ))}
      </div>

      <div className="draft-seven-layout">
        <div className="draft-seven-col-roll">
          <DraftRollPanel
            draft={draft}
            draftMode={draftMode}
            nation={nation}
            pickableCount={pickableCount}
            hideRatings={hideRatings}
            rolling={rolling}
            canReroll={canReroll(draft)}
            onReroll={handleReroll}
            onPick={onPick}
            canPick={(player) => canPickPlayer(draft, player)}
            squadPlayers={current?.options ?? []}
          />
        </div>

        <div className="draft-seven-col-pitch">
          <p className="d7-eyebrow mb-2">
            {t.common.yourXi} ({partialTeam.players.length}/{total})
          </p>
          <DraftPitch
            team={partialTeam}
            formation={draft.formation as FormationId}
            selectedPosition={openPosition ?? undefined}
            variant="seven"
            slotProgress={slotProgress}
          />
          {openPosition && (
            <p className="draft-seven-pitch-hint">{t.common.tapPositionHint}</p>
          )}
        </div>

        <div className="draft-seven-col-box">
          <DraftBoxScore draft={draft} draftMode={draftMode} totalSlots={total} />
        </div>
      </div>
    </div>
  )
}
