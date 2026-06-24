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
  getFilledCount,
  getFormationSlotProgress,
  getNationDraftRounds,
  getOpenPosition,
  getPickableForRound,
  type NationDraftState,
} from "@/lib/draft-nation-roll"
import type { DraftMode, Player } from "@/types/wc26"
import type { FormationId } from "@/lib/formations"

interface NationDraftBoardProps {
  draft: NationDraftState
  draftMode: DraftMode
  onPick: (player: Player) => void
  onReroll: () => void
  onAutofillRound: () => void
  onAutofillRemaining: () => void
  onUndo: () => void
}

export function NationDraftBoard({
  draft,
  draftMode,
  onPick,
  onReroll,
  onAutofillRound,
  onAutofillRemaining,
  onUndo,
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
  const pickableCount = getPickableForRound(draft).length
  const filledCount = getFilledCount(draft)
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

  const handleSlotClick = (slotIndex: number) => {
    const slot = slotProgress[slotIndex]
    if (!slot) return
    if (slot.filled) {
      onUndo()
    }
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
          <button
            key={`${slot.position}-${i}`}
            type="button"
            title={slot.player?.name ?? slot.position}
            onClick={slot.filled ? () => handleSlotClick(i) : undefined}
            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-1.5 text-[10px] font-bold transition ${
              slot.current
                ? "border-gold bg-gold/20 text-gold glow-gold"
                : slot.filled
                  ? "border-grass/50 bg-grass/15 text-foreground hover:border-gold/50"
                  : "border-border bg-muted/30 text-muted-foreground"
            }`}
          >
            {slot.filled ? getPositionEmoji(slot.position) : slot.position}
          </button>
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
            filledCount={filledCount}
            totalSlots={total}
          />
        </div>

        <div className="draft-seven-col-pitch">
          <p className="d7-eyebrow mb-2">
            {t.common.yourXi} ({filledCount}/{total})
          </p>
          <DraftPitch
            team={partialTeam}
            formation={draft.formation as FormationId}
            selectedPosition={openPosition ?? undefined}
            variant="seven"
            slotProgress={slotProgress}
            onSlotClick={(_, index) => handleSlotClick(index)}
          />
          <p className="draft-seven-pitch-hint">
            {filledCount > 0 ? t.common.tapSlotUndo : t.common.tapPositionHint}
          </p>
        </div>

        <div className="draft-seven-col-box">
          <DraftBoxScore
            draft={draft}
            draftMode={draftMode}
            totalSlots={total}
            onAutofillRound={onAutofillRound}
            onAutofillRemaining={onAutofillRemaining}
            canAutofill={pickableCount > 0}
            isComplete={draft.completed}
          />
        </div>
      </div>
    </div>
  )
}
