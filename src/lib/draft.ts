// ---------------------------------------------------------------------------
// WC26 – Draft Engine
// ---------------------------------------------------------------------------

import { players } from "@/data/players";
import {
  type FormationId,
  getFormationLabel,
  getFormationSlots,
} from "@/lib/formations";
import type { Player, DraftPick, DraftTeam, TeamCode } from "@/types/wc26";

export type { FormationId };
export { FORMATION_LIST, FORMATIONS } from "@/lib/formations";

export const OPTIONS_PER_ROUND = 5;

export interface DraftState {
  round: number;
  picks: DraftPick[];
  completed: boolean;
  seed: number;
  formation: FormationId;
}

function getSlots(state: DraftState): readonly Player["position"][] {
  return getFormationSlots(state.formation);
}

export function getRounds(state: DraftState): number {
  return getSlots(state).length;
}

/** Deterministic PRNG so seeding works. */
function mulberry32(seed: number) {
  let t = seed + 0x6d2b79f5;
  return function () {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function makeSeed(input?: string | number): number {
  if (input === undefined) return Math.floor(Math.random() * 1e9);
  if (typeof input === "number") return Math.floor(Math.abs(input)) || 1;
  return cyrb53(input);
}

function shuffle<T>(array: T[], rng: () => number): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickOptions(
  round: number,
  used: Set<string>,
  rng: () => number,
  slots: readonly Player["position"][],
): Player[] {
  const position = slots[round];
  const candidates = players.filter((pl) => pl.position === position && !used.has(pl.id));
  const shuffled = shuffle(candidates, rng);
  return shuffled.slice(0, OPTIONS_PER_ROUND);
}

export function startDraft(
  seed?: string | number,
  formation: FormationId = "4-3-3",
): DraftState {
  const s = makeSeed(seed);
  const rng = mulberry32(s);
  const slots = getFormationSlots(formation);
  const used = new Set<string>();
  const firstOptions = pickOptions(0, used, rng, slots);
  return {
    round: 0,
    picks: [{ round: 0, options: firstOptions }],
    completed: false,
    seed: s,
    formation,
  };
}

export function makePick(state: DraftState, playerId: string): DraftState {
  if (state.completed) return state;

  const slots = getSlots(state);
  const currentPick = state.picks[state.round];
  const chosen = currentPick.options.find((pl) => pl.id === playerId);
  if (!chosen) return state;

  const newPicks = state.picks.map((pick, idx) =>
    idx === state.round ? { ...pick, chosen } : pick,
  );

  const used = new Set(newPicks.map((p) => p.chosen?.id).filter(Boolean) as string[]);
  const nextRound = state.round + 1;

  if (nextRound >= slots.length) {
    return {
      ...state,
      picks: newPicks,
      round: nextRound,
      completed: true,
    };
  }

  const rng = mulberry32(state.seed + nextRound);
  const nextOptions = pickOptions(nextRound, used, rng, slots);

  return {
    ...state,
    picks: [...newPicks, { round: nextRound, options: nextOptions }],
    round: nextRound,
    completed: false,
  };
}

export function simulateDraft(
  seed?: string | number,
  formation: FormationId = "4-3-3",
): DraftState {
  const rng = mulberry32(makeSeed(seed));
  let state = startDraft(makeSeed(seed), formation);
  while (!state.completed) {
    const options = state.picks[state.round].options;
    const choice = options[Math.floor(rng() * options.length)];
    state = makePick(state, choice.id);
  }
  return state;
}

export function buildDraftTeam(picks: DraftPick[], formation: FormationId = "4-3-3"): DraftTeam {
  const chosen = picks.map((p) => p.chosen).filter((p): p is Player => p !== undefined);
  const rating = Math.round(calculateDraftRating(chosen));
  return {
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    players: chosen,
    formation: getFormationLabel(formation),
    rating,
  };
}

export function calculateDraftRating(playersList: readonly Player[]): number {
  if (playersList.length === 0) return 0;
  const weights: Record<Player["position"], number> = {
    GK: 0.9,
    CB: 1.0,
    LB: 1.0,
    RB: 1.0,
    DM: 1.05,
    CM: 1.1,
    AM: 1.15,
    LW: 1.15,
    RW: 1.15,
    ST: 1.2,
  };
  let totalWeight = 0;
  let weightedSum = 0;
  for (const pl of playersList) {
    const w = weights[pl.position] ?? 1;
    totalWeight += w;
    weightedSum += pl.rating * w;
  }
  return totalWeight ? weightedSum / totalWeight : 0;
}

export function getDraftPositionName(state: DraftState, round: number): string {
  const slot = getSlots(state)[round];
  const names: Record<Player["position"], string> = {
    GK: "Goleiro",
    RB: "Lateral Direito",
    CB: "Zagueiro",
    LB: "Lateral Esquerdo",
    DM: "Volante",
    CM: "Meio-campista",
    AM: "Meia Ofensivo",
    RW: "Ponta Direita",
    LW: "Ponta Esquerda",
    ST: "Centroavante",
  };
  return names[slot] ?? slot;
}

export function getPositionEmoji(position: Player["position"]): string {
  const map: Record<Player["position"], string> = {
    GK: "🧤",
    CB: "🛡️",
    LB: "🛡️",
    RB: "🛡️",
    DM: "🧠",
    CM: "🧠",
    AM: "🎩",
    LW: "⚡",
    RW: "⚡",
    ST: "🎯",
  };
  return map[position];
}

export function getTeamCodeForPlayer(player: Player): TeamCode {
  return player.team;
}

/** @deprecated use getRounds(state) */
export const ROUNDS = 11;
