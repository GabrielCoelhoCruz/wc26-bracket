// ---------------------------------------------------------------------------
// WC26 – Draft lineup ratings (attack / defense / overall)
// ---------------------------------------------------------------------------

import {
  SLOT_ATTACK_WEIGHT,
  SLOT_DEFENSE_WEIGHT,
  type DraftPosition,
} from "@/lib/draft-positions";
import type { Player } from "@/types/wc26";

function weightedMeanFromSlots(
  slots: readonly DraftPosition[],
  filled: readonly (Player | undefined)[],
  weights: Record<DraftPosition, number>,
): number {
  let sum = 0;
  let total = 0;
  slots.forEach((slot, i) => {
    const w = weights[slot] ?? 0;
    total += w;
    const player = filled[i];
    if (player) sum += player.rating * w;
  });
  return total ? sum / total : 0;
}

/** Slot-weighted ratings aligned to formation (7a0 box-score pattern). */
export function calculateLineupRatingsFromSlots(
  slots: readonly DraftPosition[],
  filled: readonly (Player | undefined)[],
): {
  attack: number;
  defense: number;
  overall: number;
} {
  const placed = filled.filter((p): p is Player => p !== undefined);
  const attack = Math.round(weightedMeanFromSlots(slots, filled, SLOT_ATTACK_WEIGHT));
  const defense = Math.round(weightedMeanFromSlots(slots, filled, SLOT_DEFENSE_WEIGHT));
  const overall = Math.round(
    placed.length ? placed.reduce((acc, p) => acc + p.rating, 0) / placed.length : 0,
  );
  return { attack, defense, overall };
}

/** Legacy helper when only a flat player list is available. */
export function calculateLineupRatings(players: readonly Player[]): {
  attack: number;
  defense: number;
  overall: number;
} {
  const slots = players.map((p) => p.position);
  return calculateLineupRatingsFromSlots(slots, players);
}
