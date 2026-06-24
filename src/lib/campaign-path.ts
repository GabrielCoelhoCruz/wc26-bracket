// ---------------------------------------------------------------------------
// WC26 – Campaign Bracket Path
// ---------------------------------------------------------------------------

import { bracketSlots, getSlot } from "@/data/knockout-bracket";
import {
  resolveFullBracket,
  resolveR32Teams,
  type ResolvedBracketMatch,
} from "@/lib/bracket-resolver";
import { getPredictions } from "@/lib/bracket-store";
import { buildNationSquad } from "@/lib/nation-squad";
import { simulateMatch } from "@/lib/draft-sim";
import type { FormationId } from "@/lib/formations";
import type {
  BracketPrediction,
  CampaignMatch,
  DraftTeam,
  Match,
  PlayStyle,
  TeamCode,
  UserSlot,
} from "@/types/wc26";

const KNOCKOUT_PATH_STAGES = ["r32", "r16", "qf", "sf", "final"] as const;

const STAGE_LABELS: Record<string, string> = {
  r32: "32 Avos de Final",
  r16: "Oitavas de Final",
  qf: "Quartas de Final",
  sf: "Semifinal",
  final: "Final",
};

export interface KnockoutTree {
  matches: ResolvedBracketMatch[];
  byId: Map<string, ResolvedBracketMatch>;
  predictions: BracketPrediction;
}

export function getResolvedKnockoutTree(
  predictions: BracketPrediction,
  sourceMatches: readonly Match[],
): KnockoutTree {
  const matches = resolveFullBracket(predictions, sourceMatches);
  const byId = new Map(matches.map((m) => [m.matchId, m]));
  return { matches, byId, predictions };
}

/** How many R32 slots have a team assigned (max 32) */
export function countR32ResolvedTeams(sourceMatches: readonly Match[]): number {
  const r32 = resolveR32Teams(sourceMatches);
  let count = 0;
  for (const [, team] of r32) {
    if (team) count++;
  }
  return count;
}

export function isR32Ready(sourceMatches: readonly Match[]): boolean {
  return countR32ResolvedTeams(sourceMatches) >= 32;
}

/** R32 matches where both teams are known */
export function getValidEntryMatches(tree: KnockoutTree): ResolvedBracketMatch[] {
  return tree.matches.filter(
    (m) =>
      m.round === 1 &&
      m.homeTeam !== null &&
      m.awayTeam !== null,
  );
}

export function pickEntryMatch(
  tree: KnockoutTree,
  seed?: number,
): { matchId: string; userSlot: UserSlot; opponent: TeamCode } | null {
  const valid = getValidEntryMatches(tree);
  if (valid.length === 0) return null;

  const s = seed ?? Math.floor(Math.random() * 1e9);
  const idx = Math.abs(s) % valid.length;
  const match = valid[idx]!;
  const userSlot: UserSlot = s % 2 === 0 ? "home" : "away";
  const opponent = userSlot === "home" ? match.awayTeam! : match.homeTeam!;

  return { matchId: match.matchId, userSlot, opponent };
}

function getSlotsForMatch(matchId: string) {
  return bracketSlots.filter((s) => s.matchId === matchId);
}

/** Trace knockout path from entry through final (5 matches) */
export function getUserKnockoutPath(
  entryMatchId: string,
  userSlot: UserSlot,
): string[] {
  const path: string[] = [entryMatchId];
  let currentMatchId = entryMatchId;
  let currentUserSlot = userSlot;

  for (let step = 0; step < 4; step++) {
    const slots = getSlotsForMatch(currentMatchId);
    const userBracketSlot = slots.find(
      (s) => s.position === (currentUserSlot === "home" ? 1 : 2),
    );
    if (!userBracketSlot?.nextSlotId) break;

    const nextSlot = getSlot(userBracketSlot.nextSlotId);
    if (!nextSlot?.matchId) break;

    if (nextSlot.matchId === "third-place") break;

    path.push(nextSlot.matchId);
    currentMatchId = nextSlot.matchId;
    currentUserSlot = nextSlot.position === 1 ? "home" : "away";
  }

  return path.filter((id) => id !== "third-place").slice(0, 5);
}

function resolveWinnerCpu(
  home: TeamCode,
  away: TeamCode,
  formation: FormationId,
  playStyle: PlayStyle,
  seed: number,
): TeamCode {
  const homeTeam = buildNationSquad(home, formation, playStyle);
  const awayTeam = buildNationSquad(away, formation, playStyle);
  const result = simulateMatch(homeTeam, awayTeam, { playStyle, seed });
  if (result.penaltyWinner === "home" || result.result === "home") return home;
  if (result.penaltyWinner === "away" || result.result === "away") return away;
  return homeTeam.rating >= awayTeam.rating ? home : away;
}

/** Resolve which nation occupies a slot, simulating feeder if needed */
function resolveNationInSlot(
  tree: KnockoutTree,
  slotId: string,
  formation: FormationId,
  playStyle: PlayStyle,
  seed: number,
  simulatedWinners: Map<string, TeamCode>,
): TeamCode | null {
  if (simulatedWinners.has(slotId)) {
    return simulatedWinners.get(slotId) ?? null;
  }

  const slot = getSlot(slotId);
  if (!slot) return null;

  if (slot.matchId) {
    const match = tree.byId.get(slot.matchId);
    if (match) {
      const nation = slot.position === 1 ? match.homeTeam : match.awayTeam;
      if (nation) {
        simulatedWinners.set(slotId, nation);
        return nation;
      }
    }
  }

  const feeders = bracketSlots.filter((s) => s.nextSlotId === slotId);
  if (feeders.length === 2) {
    const nationA = resolveNationForFeeder(tree, feeders[0]!, formation, playStyle, seed, simulatedWinners);
    const nationB = resolveNationForFeeder(tree, feeders[1]!, formation, playStyle, seed, simulatedWinners);
    if (nationA && nationB) {
      const winner = resolveWinnerCpu(nationA, nationB, formation, playStyle, seed + slotId.length);
      simulatedWinners.set(slotId, winner);
      return winner;
    }
  }

  return null;
}

function resolveNationForFeeder(
  tree: KnockoutTree,
  feederSlot: (typeof bracketSlots)[number],
  formation: FormationId,
  playStyle: PlayStyle,
  seed: number,
  simulatedWinners: Map<string, TeamCode>,
): TeamCode | null {
  const matchId = feederSlot.matchId;
  if (!matchId) return null;

  const match = tree.byId.get(matchId);
  if (!match) return null;

  const pred = tree.predictions[matchId];
  if (pred?.winner) {
    simulatedWinners.set(feederSlot.id, pred.winner);
    return pred.winner;
  }

  const home = match.homeTeam;
  const away = match.awayTeam;
  if (home && away) {
    const winner = resolveWinnerCpu(home, away, formation, playStyle, seed + matchId.length);
    simulatedWinners.set(feederSlot.id, winner);
    return winner;
  }

  return resolveNationInSlot(tree, feederSlot.id, formation, playStyle, seed, simulatedWinners);
}

function getStageKey(matchId: string): string {
  if (matchId.startsWith("r32")) return "r32";
  if (matchId.startsWith("r16")) return "r16";
  if (matchId.startsWith("qf")) return "qf";
  if (matchId.startsWith("sf")) return "sf";
  return "final";
}

function createVirtualUserTeam(userTeam: DraftTeam): DraftTeam {
  return { ...userTeam, id: `user-${userTeam.id}` };
}

/** Build all campaign matches from entry path */
export function buildCampaignMatches(
  tree: KnockoutTree,
  userTeam: DraftTeam,
  entryMatchId: string,
  userSlot: UserSlot,
  formation: FormationId,
  playStyle: PlayStyle,
  seed: number,
): CampaignMatch[] {
  const path = getUserKnockoutPath(entryMatchId, userSlot);
  const virtualUser = createVirtualUserTeam(userTeam);
  const simulatedWinners = new Map<string, TeamCode>();
  const matches: CampaignMatch[] = [];
  let currentUserSlot = userSlot;

  for (let i = 0; i < path.length; i++) {
    const matchId = path[i]!;
    const resolved = tree.byId.get(matchId);
    const stage = getStageKey(matchId);
    const label = STAGE_LABELS[stage] ?? resolved?.label ?? matchId;

    let opponentNation: TeamCode | null = null;
    const slots = getSlotsForMatch(matchId);
    const userPos = currentUserSlot === "home" ? 1 : 2;
    const oppPos = userPos === 1 ? 2 : 1;
    const oppSlot = slots.find((s) => s.position === oppPos);

    if (i === 0 && resolved) {
      opponentNation = currentUserSlot === "home" ? resolved.awayTeam : resolved.homeTeam;
    } else if (oppSlot) {
      opponentNation = resolveNationInSlot(tree, oppSlot.id, formation, playStyle, seed + i, simulatedWinners);
    }

    if (!opponentNation) continue;

    const opponentSquad = buildNationSquad(opponentNation, formation, playStyle);
    const isHome = currentUserSlot === "home";

    matches.push({
      matchId,
      stage,
      label,
      home: isHome ? virtualUser : opponentSquad,
      away: isHome ? opponentSquad : virtualUser,
      homeNation: isHome ? undefined : opponentNation,
      awayNation: isHome ? opponentNation : undefined,
      userSlot: currentUserSlot,
      result: undefined,
    });

    const userBracketSlot = slots.find((s) => s.position === userPos);
    if (userBracketSlot?.nextSlotId) {
      const nextSlot = getSlot(userBracketSlot.nextSlotId);
      if (nextSlot && nextSlot.matchId !== "third-place") {
        currentUserSlot = nextSlot.position === 1 ? "home" : "away";
      }
    }
  }

  return matches;
}

export function loadBracketTree(sourceMatches: readonly Match[]): KnockoutTree {
  return getResolvedKnockoutTree(getPredictions(), sourceMatches);
}

export function getKnockoutStageOrder(): readonly string[] {
  return KNOCKOUT_PATH_STAGES;
}
