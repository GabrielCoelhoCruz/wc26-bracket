// ---------------------------------------------------------------------------
// WC26 – Nation Dice Draft (7a0 style)
// ---------------------------------------------------------------------------

import { teams } from "@/data/teams";
import { getPlayersByTeam } from "@/data/players";
import { canPlaySlot } from "@/lib/draft-positions";
import { compareSquadPlayers } from "@/lib/position-map";
import { getFormationSlots, getFormationLabel, type FormationId } from "@/lib/formations";
import { getPositionLabel, getPositionAbbrev, type Locale } from "@/lib/i18n";
import { buildDraftTeam, calculateDraftRating } from "@/lib/draft";
import type {
  DraftMode,
  DraftTeam,
  NationDraftRound,
  Player,
  TeamCode,
} from "@/types/wc26";

export const REROLL_LIMIT: Record<DraftMode, number> = {
  classic: 3,
  almanaque: 1,
};

export interface NationDraftState {
  formation: FormationId;
  draftMode: DraftMode;
  draftRounds: NationDraftRound[];
  round: number;
  completed: boolean;
  seed: number;
}

function mulberry32(seed: number) {
  let t = seed + 0x6d2b79f5;
  return function () {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let h = 0x6a09e667 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 0xcc9e2d51);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function makeRng(seed: number, ...parts: (string | number)[]): () => number {
  const key = [seed, ...parts].join(":");
  return mulberry32(hashString(key));
}

function makeSeed(input?: string | number): number {
  if (input === undefined) return Math.floor(Math.random() * 1e9);
  if (typeof input === "number") return Math.floor(Math.abs(input)) || 1;
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(31, h) + input.charCodeAt(i);
  }
  return Math.abs(h) || 1;
}

function nationWeights(pool: TeamCode[]): number[] {
  const ratings = pool.map((code) => teams.find((t) => t.code === code)?.rating ?? 70);
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);
  const span = max - min || 1;
  return ratings.map((r) => 0.25 + 0.75 * ((r - min) / span));
}

function pickWeighted(rng: () => number, pool: TeamCode[]): TeamCode {
  if (pool.length === 0) return teams[0]!.code;
  if (pool.length === 1) return pool[0]!;
  const weights = nationWeights(pool);
  const total = weights.reduce((sum, w) => sum + w, 0);
  let r = rng() * total;
  for (let i = 0; i < pool.length; i++) {
    if ((r -= weights[i]!) <= 0) return pool[i]!;
  }
  return pool[pool.length - 1]!;
}

export function rollNation(rng: () => number, exclude?: Set<TeamCode>): TeamCode {
  const pool = teams.map((t) => t.code).filter((c) => !exclude?.has(c));
  return pickWeighted(rng, pool);
}

export function getOpenPosition(state: NationDraftState): Player["position"] | null {
  const slots = getFormationSlots(state.formation);
  if (state.completed || state.round >= slots.length) return null;
  return slots[state.round] ?? null;
}

function getPickedPlayerIds(state: NationDraftState): Set<string> {
  return new Set(
    state.draftRounds.map((r) => r.chosen?.id).filter(Boolean) as string[],
  );
}

export function getFilledCount(state: NationDraftState): number {
  return state.draftRounds.filter((r) => r.chosen).length;
}

/** Full squad for display; pickable = players matching the open slot (with flex). */
export function getSquadForRound(
  nation: TeamCode,
  openPosition: Player["position"],
  pickedIds: Set<string>,
): { squad: Player[]; pickable: Player[] } {
  const squad = getPlayersByTeam(nation).filter((p) => !pickedIds.has(p.id));
  const pickable = squad.filter((p) => canPlaySlot(p, openPosition));
  const sorted = [...squad].sort((a, b) => {
    const aMatch = canPlaySlot(a, openPosition) ? 0 : 1;
    const bMatch = canPlaySlot(b, openPosition) ? 0 : 1;
    if (aMatch !== bMatch) return aMatch - bMatch;
    return compareSquadPlayers(a, b);
  });
  return { squad: sorted, pickable };
}

export function getOptionsForRound(
  nation: TeamCode,
  position: Player["position"],
  pickedIds: Set<string> = new Set(),
): Player[] {
  return getSquadForRound(nation, position, pickedIds).squad;
}

export function canPickPlayer(
  state: NationDraftState,
  player: Player,
): boolean {
  const open = getOpenPosition(state);
  if (!open) return false;
  if (!canPlaySlot(player, open)) return false;
  if (getPickedPlayerIds(state).has(player.id)) return false;
  return true;
}

function rollNationWithOptions(
  state: NationDraftState,
  rng: () => number,
): { nation: TeamCode; options: Player[] } {
  const position = getOpenPosition(state);
  if (!position) {
    return { nation: teams[0]!.code, options: [] };
  }

  const pickedIds = getPickedPlayerIds(state);
  const usedNations = new Set(
    state.draftRounds.map((r) => r.rolledNation),
  );

  for (let attempt = 0; attempt < 30; attempt++) {
    const nation = rollNation(rng, attempt > 15 ? undefined : usedNations);
    const { squad, pickable } = getSquadForRound(nation, position, pickedIds);
    if (pickable.length > 0) {
      return { nation, options: squad };
    }
  }

  const nation = rollNation(rng);
  return { nation, options: getSquadForRound(nation, position, pickedIds).squad };
}

export function startNationDraft(
  formation: FormationId,
  draftMode: DraftMode,
  seed?: string | number,
): NationDraftState {
  const s = makeSeed(seed);
  const rng = makeRng(s, "start");
  const state: NationDraftState = {
    formation,
    draftMode,
    draftRounds: [],
    round: 0,
    completed: false,
    seed: s,
  };

  const { nation, options } = rollNationWithOptions(state, rng);
  return {
    ...state,
    draftRounds: [{ round: 0, rolledNation: nation, options, rerollsUsed: 0 }],
  };
}

export function getNationDraftRounds(state: NationDraftState): number {
  return getFormationSlots(state.formation).length;
}

export function canReroll(state: NationDraftState): boolean {
  if (state.completed) return false;
  const current = state.draftRounds[state.round];
  if (!current) return false;
  const limit = REROLL_LIMIT[state.draftMode];
  return current.rerollsUsed < limit;
}

export function getPickableForRound(state: NationDraftState): Player[] {
  const current = state.draftRounds[state.round];
  if (!current) return [];
  return current.options.filter((p) => canPickPlayer(state, p));
}

export function rerollNation(state: NationDraftState): NationDraftState {
  if (!canReroll(state)) return state;

  const current = state.draftRounds[state.round]!;
  const rng = makeRng(state.seed, "round", state.round, "rr", current.rerollsUsed + 1);
  const { nation, options } = rollNationWithOptions(state, rng);

  const newRounds = state.draftRounds.map((r, idx) =>
    idx === state.round
      ? {
          ...r,
          rolledNation: nation,
          options,
          rerollsUsed: r.rerollsUsed + 1,
        }
      : r,
  );

  return { ...state, draftRounds: newRounds };
}

/** Auto-reroll when the drawn nation has nobody for the open slot (7a0 never shows dead pools). */
export function ensurePickableNation(state: NationDraftState): NationDraftState {
  if (state.completed || getPickableForRound(state).length > 0) return state;
  let next = state;
  let guard = 0;
  while (getPickableForRound(next).length === 0 && canReroll(next) && guard < REROLL_LIMIT[next.draftMode]) {
    next = rerollNation(next);
    guard += 1;
  }
  return next;
}

export function pickNationPlayer(state: NationDraftState, playerId: string): NationDraftState {
  if (state.completed) return state;

  const current = state.draftRounds[state.round];
  if (!current) return state;

  const chosen = current.options.find((p) => p.id === playerId);
  if (!chosen || !canPickPlayer(state, chosen)) return state;

  const newRounds = state.draftRounds.map((r, idx) =>
    idx === state.round ? { ...r, chosen } : r,
  );

  const nextRound = state.round + 1;
  const totalRounds = getNationDraftRounds(state);

  if (nextRound >= totalRounds) {
    return {
      ...state,
      draftRounds: newRounds,
      round: nextRound,
      completed: true,
    };
  }

  const rng = makeRng(state.seed, "round", nextRound);
  let nextState: NationDraftState = {
    ...state,
    draftRounds: [...newRounds, { round: nextRound, rolledNation: teams[0]!.code, options: [], rerollsUsed: 0 }],
    round: nextRound,
    completed: false,
  };
  const { nation, options } = rollNationWithOptions(nextState, rng);
  nextState = {
    ...nextState,
    draftRounds: nextState.draftRounds.map((r, idx) =>
      idx === nextRound ? { ...r, rolledNation: nation, options } : r,
    ),
  };
  return ensurePickableNation(nextState);
}

/** Pick the strongest eligible player for the current round (7a0 autofill). */
export function autofillRound(state: NationDraftState): NationDraftState {
  const pickable = getPickableForRound(state);
  if (pickable.length === 0) return state;
  const best = [...pickable].sort((a, b) => b.rating - a.rating)[0]!;
  return pickNationPlayer(state, best.id);
}

/** Fill every remaining round with the best eligible pick per round. */
export function autofillRemaining(state: NationDraftState): NationDraftState {
  let next = state;
  while (!next.completed) {
    const before = getFilledCount(next);
    next = autofillRound(next);
    if (getFilledCount(next) === before) break;
  }
  return next;
}

/** Undo the most recent pick and return to that round (7a0 tap-slot undo). */
export function undoLastPick(state: NationDraftState): NationDraftState {
  const lastWithPick = state.draftRounds.findLastIndex((r) => r.chosen);
  if (lastWithPick < 0) return state;

  const newRounds = state.draftRounds
    .slice(0, lastWithPick + 1)
    .map((r, idx) => (idx === lastWithPick ? { ...r, chosen: undefined } : r));

  return {
    ...state,
    draftRounds: newRounds,
    round: lastWithPick,
    completed: false,
  };
}

export function buildTeamFromNationDraft(state: NationDraftState): DraftTeam {
  const picks = state.draftRounds.map((r) => ({
    round: r.round,
    options: r.options,
    chosen: r.chosen,
  }));
  return buildDraftTeam(picks, state.formation);
}

/** In-progress XI for pitch preview during draft */
export function buildPartialDraftTeam(state: NationDraftState): DraftTeam {
  const slots = getFormationSlots(state.formation);
  const chosen = slots.map((_, index) => state.draftRounds[index]?.chosen).filter(
    (p): p is Player => p !== undefined,
  );
  return {
    id: `partial-${state.seed}`,
    players: chosen,
    formation: getFormationLabel(state.formation),
    rating: chosen.length ? Math.round(calculateDraftRating(chosen)) : 0,
  };
}

export function getFormationSlotProgress(state: NationDraftState): {
  position: Player["position"];
  filled: boolean;
  current: boolean;
  player?: Player;
}[] {
  const slots = getFormationSlots(state.formation);
  return slots.map((position, index) => {
    const round = state.draftRounds[index];
    return {
      position,
      filled: !!round?.chosen,
      current: index === state.round && !state.completed,
      player: round?.chosen,
    };
  });
}

export function getOpenPositionName(state: NationDraftState, locale: Locale = "pt-BR"): string {
  const position = getOpenPosition(state);
  return position ? getPositionLabel(position, locale) : "";
}

export function getOpenPositionAbbrev(state: NationDraftState, locale: Locale = "pt-BR"): string {
  const position = getOpenPosition(state);
  return position ? getPositionAbbrev(position, locale) : "";
}
