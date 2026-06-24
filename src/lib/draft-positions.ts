// ---------------------------------------------------------------------------
// WC26 – Draft position flexibility (7a0-style multi-position fit)
// ---------------------------------------------------------------------------

import type { Player } from "@/types/wc26";

export type DraftPosition = Player["position"];

/** Positions a player can fill on the pitch (same role band, flexible like 7a0). */
const FLEX_POSITIONS: Record<DraftPosition, readonly DraftPosition[]> = {
  GK: ["GK"],
  CB: ["CB", "RB", "LB"],
  LB: ["LB", "RB", "CB"],
  RB: ["RB", "LB", "CB"],
  DM: ["DM", "CM"],
  CM: ["CM", "DM", "AM"],
  AM: ["AM", "CM", "RW", "LW"],
  LW: ["LW", "RW", "ST", "AM"],
  RW: ["RW", "LW", "ST", "AM"],
  ST: ["ST", "LW", "RW"],
};

/** Attack weight per formation slot (7a0 box-score pattern). */
export const SLOT_ATTACK_WEIGHT: Record<DraftPosition, number> = {
  GK: 0,
  CB: 0,
  LB: 0,
  RB: 0,
  DM: 0.2,
  CM: 0.5,
  AM: 0.8,
  LW: 1,
  RW: 1,
  ST: 1,
};

/** Defense weight per formation slot. */
export const SLOT_DEFENSE_WEIGHT: Record<DraftPosition, number> = {
  GK: 1,
  CB: 1,
  LB: 1,
  RB: 1,
  DM: 0.8,
  CM: 0.5,
  AM: 0.2,
  LW: 0,
  RW: 0,
  ST: 0,
};

export function getFlexiblePositions(position: DraftPosition): readonly DraftPosition[] {
  return FLEX_POSITIONS[position] ?? [position];
}

export function canPlaySlot(player: Player, slotPosition: DraftPosition): boolean {
  return getFlexiblePositions(player.position).includes(slotPosition);
}
