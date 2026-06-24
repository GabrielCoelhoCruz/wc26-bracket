"use client"

import type { DraftTeam } from "@/types/wc26"
import { PITCH_COORDS, PITCH_LAYOUTS, type FormationId } from "@/lib/formations"
import PlayerSlot from "@/components/draft/PlayerSlot"
import { useLanguage } from "@/components/i18n/LanguageProvider"
import type { Player } from "@/types/wc26"

interface SlotProgress {
  position: Player["position"]
  filled: boolean
  current: boolean
  player?: Player
}

interface DraftPitchProps {
  team: DraftTeam
  formation?: FormationId
  onSlotClick?: (position: string, index: number) => void
  selectedPosition?: string
  variant?: "default" | "seven"
  slotProgress?: SlotProgress[]
}

function findPlayerForSlot(
  team: DraftTeam,
  position: string,
  usedIds: Set<string>,
) {
  const player = team.players.find(
    (p) => p.position === position && !usedIds.has(p.id),
  )
  if (player) {
    usedIds.add(player.id)
    return player
  }
  return team.players.find((p) => !usedIds.has(p.id))
}

function buildCoordSlots(
  team: DraftTeam,
  coords: typeof PITCH_COORDS[FormationId],
  slotProgress?: SlotProgress[],
) {
  const usedIds = new Set<string>()
  return coords.map((coord, index) => {
    const progress = slotProgress?.[index]
    const player =
      progress?.player ??
      findPlayerForSlot(team, coord.position, usedIds)
    if (player && !progress?.player) usedIds.add(player.id)
    return {
      ...coord,
      player,
      current: progress?.current ?? false,
      filled: progress?.filled ?? !!player,
    }
  })
}

function buildGridSlots(team: DraftTeam, layout: typeof PITCH_LAYOUTS[FormationId]) {
  const usedIds = new Set<string>()
  return layout.map((slot) => ({
    ...slot,
    player: findPlayerForSlot(team, slot.position, usedIds),
  }))
}

export function DraftPitch({
  team,
  formation,
  onSlotClick,
  selectedPosition,
  variant = "default",
  slotProgress,
}: DraftPitchProps) {
  const { format, t } = useLanguage()
  const formationId = (formation ?? team.formation) as FormationId
  const layout = PITCH_LAYOUTS[formationId] ?? PITCH_LAYOUTS["4-3-3"]
  const coords = PITCH_COORDS[formationId] ?? PITCH_COORDS["4-3-3"]
  const maxCol = Math.max(...layout.map((s) => s.col))
  const maxRow = Math.max(...layout.map((s) => s.row))

  const coordSlots = buildCoordSlots(team, coords, slotProgress)
  const gridSlots = buildGridSlots(team, layout)

  if (variant === "seven") {
    return (
      <div
        className="draft-seven-pitch-outer"
        aria-label={format(t.common.pitchAria, { formation: formationId })}
      >
        <div className="draft-seven-pitch-wrap">
          <div className="draft-seven-pitch" />
          <svg
            className="draft-seven-pitch-markings"
            viewBox="0 0 100 133"
            preserveAspectRatio="none"
            aria-hidden
          >
            <rect x="8" y="8" width="84" height="117" />
            <line x1="8" y1="66.5" x2="92" y2="66.5" />
            <circle cx="50" cy="66.5" r="10" />
            <rect x="28" y="8" width="44" height="18" />
            <rect x="28" y="107" width="44" height="18" />
          </svg>

          {coordSlots.map((slot, i) => {
            const pos = { left: `${slot.x}%`, top: `${slot.y}%` }
            const isEmpty = !slot.player
            const isPickable = slot.current && isEmpty
            const isActive = slot.current || selectedPosition === slot.position

            return (
              <PlayerSlot
                key={`${slot.position}-${i}`}
                position={slot.position}
                player={slot.player}
                selected={isActive}
                pickable={isPickable}
                variant="seven"
                style={pos}
                onClick={onSlotClick ? () => onSlotClick(slot.position, i) : undefined}
              />
            )
          })}
        </div>
      </div>
    )
  }

  const rowCount = maxRow + 1
  const colCount = maxCol + 1
  const avgRating =
    team.players.length > 0
      ? Math.round(
          team.players.reduce((sum, p) => sum + p.rating, 0) / team.players.length,
        )
      : 0

  return (
    <div
      className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-grass/50 bg-gradient-to-b from-grass-dark/40 to-background"
      aria-label={format(t.common.pitchAria, { formation: formationId })}
    >
      <div className="absolute inset-4 rounded-xl border border-white/15" />
      <div className="absolute left-1/2 top-4 h-12 w-24 -translate-x-1/2 rounded-b-lg border border-white/15 border-t-0" />
      <div className="absolute bottom-4 left-1/2 h-12 w-24 -translate-x-1/2 rounded-t-lg border border-white/15 border-b-0" />
      <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold backdrop-blur-sm">
        <span className="text-grass">{formationId}</span>
        {avgRating > 0 && (
          <>
            <span className="text-muted-foreground">·</span>
            <span className="font-scoreboard text-gold">⭐ {avgRating}</span>
          </>
        )}
      </div>

      <div
        className="relative grid h-full gap-2 p-4 pt-6 pb-8"
        style={{ gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: rowCount }, (_, row) => {
          const rowSlots = gridSlots
            .filter((s) => s.row === row)
            .sort((a, b) => a.col - b.col)

          if (rowSlots.length === 1) {
            const slot = rowSlots[0]!
            const slotIndex = gridSlots.indexOf(slot)
            return (
              <div key={row} className="flex flex-1 items-center justify-center">
                <div className="w-[22%] min-w-[4rem] max-w-[5.5rem]">
                  <PlayerSlot
                    position={slot.position}
                    player={slot.player}
                    selected={selectedPosition === slot.position}
                    onClick={
                      onSlotClick
                        ? () => onSlotClick(slot.position, slotIndex)
                        : undefined
                    }
                  />
                </div>
              </div>
            )
          }

          return (
            <div
              key={row}
              className="grid flex-1 items-center gap-1"
              style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: colCount }, (_, col) => {
                const slot = rowSlots.find((s) => s.col === col)
                if (!slot) return <div key={col} />
                const slotIndex = gridSlots.indexOf(slot)

                return (
                  <PlayerSlot
                    key={`${row}-${col}`}
                    position={slot.position}
                    player={slot.player}
                    selected={selectedPosition === slot.position}
                    onClick={
                      onSlotClick
                        ? () => onSlotClick(slot.position, slotIndex)
                        : undefined
                    }
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
