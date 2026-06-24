// ---------------------------------------------------------------------------
// WC26 – Nation Dice Draft (7a0 style)
// ---------------------------------------------------------------------------

import { teams } from "@/data/teams";
import { getPlayersByTeam } from "@/data/players";
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

function makeSeed(input?: string | number): number {
  if (input === undefined) return Math.floor(Math.random() * 1e9);
  if (typeof input === "number") return Math.floor(Math.abs(input)) || 1;
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(31, h) + input.charCodeAt(i);
  }
  return Math.abs(h) || 1;
}

export function rollNation(rng: () => number, exclude?: Set<TeamCode>): TeamCode {
  const pool = teams.map((t) => t.code).filter((c) => !exclude?.has(c));
  if (pool.length === 0) return teams[0]!.code;
  return pool[Math.floor(rng() * pool.length)]!;
}

export function getOpenPosition(state: NationDraftState): Player["position"] | null {
  const slots = getFormationSlots(state.formation);
  if (state.round >= slots.length) return null;
  return slots[state.round] ?? null;
}

function getPickedPlayerIds(state: NationDraftState): Set<string> {
  return new Set(
    state.draftRounds.map((r) => r.chosen?.id).filter(Boolean) as string[],
  );
}

/** Full squad for display; pickable = players matching the open slot */
export function getSquadForRound(
  nation: TeamCode,
  openPosition: Player["position"],
  pickedIds: Set<string>,
): { squad: Player[]; pickable: Player[] } {
  const squad = getPlayersByTeam(nation).filter((p) => !pickedIds.has(p.id));
  const pickable = squad.filter((p) => p.position === openPosition);
  const sorted = [...squad].sort((a, b) => {
    const aMatch = a.position === openPosition ? 0 : 1;
    const bMatch = b.position === openPosition ? 0 : 1;
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
  if (player.position !== open) return false;
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

  for (let attempt = 0; attempt < 20; attempt++) {
    const nation = rollNation(rng, attempt > 10 ? undefined : usedNations);
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
  const rng = mulberry32(s);
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

export function rerollNation(state: NationDraftState): NationDraftState {
  if (!canReroll(state)) return state;

  const rng = mulberry32(state.seed + state.round * 100 + state.draftRounds[state.round]!.rerollsUsed + 1);
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

  const rng = mulberry32(state.seed + nextRound);
  const { nation, options } = rollNationWithOptions(
    { ...state, draftRounds: newRounds, round: nextRound },
    rng,
  );

  return {
    ...state,
    draftRounds: [...newRounds, { round: nextRound, rolledNation: nation, options, rerollsUsed: 0 }],
    round: nextRound,
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
  const chosen = state.draftRounds
    .map((r) => r.chosen)
    .filter((p): p is Player => p !== undefined);
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
