// ---------------------------------------------------------------------------
// WC26 – Draft lineup ratings (attack / defense / overall)
// ---------------------------------------------------------------------------

import type { Player } from "@/types/wc26";

const ATTACK_WEIGHT: Partial<Record<Player["position"], number>> = {
  AM: 1.3,
  LW: 1.25,
  RW: 1.25,
  ST: 1.4,
  CM: 0.6,
  DM: 0.2,
};

const DEFENSE_WEIGHT: Partial<Record<Player["position"], number>> = {
  GK: 1.5,
  CB: 1.3,
  LB: 1.1,
  RB: 1.1,
  DM: 1.0,
  CM: 0.5,
};

function weightedMean(players: readonly Player[], weights: Partial<Record<Player["position"], number>>): number {
  if (players.length === 0) return 0;
  let sum = 0;
  let total = 0;
  for (const p of players) {
    const w = weights[p.position] ?? 0.15;
    sum += p.rating * w;
    total += w;
  }
  return total ? sum / total : 0;
}

export function calculateLineupRatings(players: readonly Player[]): {
  attack: number;
  defense: number;
  overall: number;
} {
  const attack = Math.round(weightedMean(players, ATTACK_WEIGHT));
  const defense = Math.round(weightedMean(players, DEFENSE_WEIGHT));
  const overall = Math.round(
    players.length
      ? players.reduce((acc, p) => acc + p.rating, 0) / players.length
      : 0,
  );
  return { attack, defense, overall };
}
