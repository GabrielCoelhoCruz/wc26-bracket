"use client"

import { useLanguage } from "@/components/i18n/LanguageProvider"
import { getPositionAbbrev } from "@/lib/i18n"
import { calculateLineupRatingsFromSlots } from "@/lib/draft-ratings"
import { getFormationSlots } from "@/lib/formations"
import { getFormationSlotProgress } from "@/lib/draft-nation-roll"
import type { NationDraftState } from "@/lib/draft-nation-roll"
import type { DraftMode } from "@/types/wc26"

interface DraftBoxScoreProps {
  draft: NationDraftState
  draftMode: DraftMode
  totalSlots: number
  onAutofillRound?: () => void
  onAutofillRemaining?: () => void
  canAutofill?: boolean
  isComplete?: boolean
}

export function DraftBoxScore({
  draft,
  draftMode,
  totalSlots,
  onAutofillRound,
  onAutofillRemaining,
  canAutofill = false,
  isComplete = false,
}: DraftBoxScoreProps) {
  const { t, locale } = useLanguage()
  const hideRatings = draftMode === "almanaque" && !draft.completed
  const slots = getFormationSlotProgress(draft)
  const formationSlots = getFormationSlots(draft.formation)
  const filledPlayers = formationSlots.map((_, i) => slots[i]?.player)
  const filled = slots.filter((s) => s.filled)
  const { attack, defense, overall } = calculateLineupRatingsFromSlots(
    formationSlots,
    filledPlayers,
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="draft-seven-box-head">
        <div>
          <p className="d7-eyebrow">{t.common.boxScore}</p>
        </div>
        <p className="d7-num">
          {filled.length}/{totalSlots}
        </p>
      </div>

      {!hideRatings && filled.length > 0 && (
        <div className="draft-seven-box-ratings">
          <div className="draft-seven-box-rating draft-seven-box-rating-atk">
            <span className="d7-num">{attack}</span>
            <span>{t.common.attack}</span>
          </div>
          <div className="draft-seven-box-rating draft-seven-box-rating-def">
            <span className="d7-num">{defense}</span>
            <span>{t.common.defense}</span>
          </div>
          <div className="draft-seven-box-rating draft-seven-box-rating-ovr">
            <span className="d7-num">{overall}</span>
            <span>{t.common.overall}</span>
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className="draft-seven-boxscore">
          <thead>
            <tr>
              <th className="d7-pos">{t.common.positionShort}</th>
              <th className="d7-pl-name">{t.common.player}</th>
              {!hideRatings && <th className="d7-val">OVR</th>}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, i) => (
              <tr
                key={`${slot.position}-${i}`}
                className={slot.current ? "is-current" : slot.filled ? "" : "opacity-50"}
              >
                <td className="d7-pos">{getPositionAbbrev(slot.position, locale)}</td>
                <td className="d7-pl-name max-w-[8rem] truncate">
                  {slot.player?.name ?? "—"}
                </td>
                {!hideRatings && (
                  <td className="d7-val">{slot.player?.rating ?? ""}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isComplete && (onAutofillRound || onAutofillRemaining) && (
        <div className="mt-4 flex flex-col gap-2">
          {onAutofillRound && (
            <button
              type="button"
              onClick={onAutofillRound}
              disabled={!canAutofill}
              className="d7-btn-secondary min-h-11 text-sm disabled:opacity-40"
            >
              {t.common.autofillRound}
            </button>
          )}
          {onAutofillRemaining && (
            <button
              type="button"
              onClick={onAutofillRemaining}
              disabled={!canAutofill}
              className="d7-btn-secondary min-h-11 text-sm disabled:opacity-40"
            >
              {t.common.autofillRemaining}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
