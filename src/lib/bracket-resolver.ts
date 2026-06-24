// ---------------------------------------------------------------------------
// WC26 – Bracket Resolver
// Maps group qualifiers to R32 bracket slots and advances winners
// ---------------------------------------------------------------------------

import { matches as defaultMatches } from "@/data/matches";
import { bracketSlots } from "@/data/knockout-bracket";
import { getGroupQualifiers, getBestThirdPlaceTeams } from "@/lib/group-standings";
import {
  defaultLocale,
  formatMessage,
  getMessages,
  type Locale,
} from "@/lib/i18n";
import type { Match, TeamCode } from "@/types/wc26";

/**
 * Group pairs that feed into R32 matches.
 * Each pair (odd group, even group) produces 2 R32 matches:
 *   Match A: 1st(odd) vs 2nd(even)
 *   Match B: 1st(even) vs 2nd(odd)
 */
export const GROUP_PAIRS: [string, string][] = [
  ["A", "B"],
  ["C", "D"],
  ["E", "F"],
  ["G", "H"],
  ["I", "J"],
  ["K", "L"],
];

export interface ResolvedBracketMatch {
  matchId: string;
  round: number;
  homeTeam: TeamCode | null;
  awayTeam: TeamCode | null;
  nextSlotId: string | null;
  label: string;
  fixture?: Match;
}

const KNOCKOUT_STAGES: Match["stage"][] = [
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "third_place",
  "final",
];

/** Map bracket matchId (r32-1, final, etc.) to API fixture data */
export function buildKnockoutFixtureMap(
  sourceMatches: readonly Match[] = defaultMatches,
): Map<string, Match> {
  const map = new Map<string, Match>();

  const byStage = (stage: Match["stage"]) =>
    sourceMatches.filter((m) => m.stage === stage);

  byStage("round_of_32").forEach((m, i) => map.set(`r32-${i + 1}`, m));
  byStage("round_of_16").forEach((m, i) => map.set(`r16-${i + 1}`, m));
  byStage("quarter_final").forEach((m, i) => map.set(`qf-${i + 1}`, m));
  byStage("semi_final").forEach((m, i) => map.set(`sf-${i + 1}`, m));

  const third = byStage("third_place")[0];
  if (third) map.set("third-place", third);

  const finalMatch = byStage("final")[0];
  if (finalMatch) map.set("final", finalMatch);

  return map;
}

export function getKnockoutFixtures(
  sourceMatches: readonly Match[] = defaultMatches,
): Match[] {
  return KNOCKOUT_STAGES.flatMap((stage) =>
    sourceMatches.filter((m) => m.stage === stage),
  );
}

type Predictions = Record<
  string,
  { winner: TeamCode; homeScore?: number; awayScore?: number }
>;

/**
 * Resolve which teams occupy each R32 slot based on group results.
 */
export function resolveR32Teams(
  sourceMatches: readonly Match[] = defaultMatches,
): Map<string, TeamCode | null> {
  const slotTeams = new Map<string, TeamCode | null>();

  for (let i = 0; i < GROUP_PAIRS.length; i++) {
    const [groupOdd, groupEven] = GROUP_PAIRS[i];
    const oddQual = getGroupQualifiers(groupOdd, sourceMatches);
    const evenQual = getGroupQualifiers(groupEven, sourceMatches);

    const slotIdxBase = i * 4;
    const r32SlotsA = bracketSlots.slice(slotIdxBase, slotIdxBase + 2);
    if (r32SlotsA[0]) slotTeams.set(r32SlotsA[0].id, oddQual.first);
    if (r32SlotsA[1]) slotTeams.set(r32SlotsA[1].id, evenQual.second);

    const r32SlotsB = bracketSlots.slice(slotIdxBase + 2, slotIdxBase + 4);
    if (r32SlotsB[0]) slotTeams.set(r32SlotsB[0].id, evenQual.first);
    if (r32SlotsB[1]) slotTeams.set(r32SlotsB[1].id, oddQual.second);
  }

  // Remaining 8 R32 slots (R32-25…R32-32) — best third-placed teams
  const thirdPlace = getBestThirdPlaceTeams(sourceMatches, 8);
  const thirdPlaceSlots = bracketSlots
    .filter((s) => s.round === 1)
    .slice(24, 32);
  for (let i = 0; i < thirdPlaceSlots.length; i++) {
    const slot = thirdPlaceSlots[i];
    if (slot) slotTeams.set(slot.id, thirdPlace[i] ?? null);
  }

  return slotTeams;
}

function getMatchLoser(
  homeTeam: TeamCode | null,
  awayTeam: TeamCode | null,
  winner: TeamCode | null,
): TeamCode | null {
  if (!winner || !homeTeam || !awayTeam) return null;
  if (winner === homeTeam) return awayTeam;
  if (winner === awayTeam) return homeTeam;
  return null;
}

/**
 * Propagate predicted winners into downstream bracket slots via nextSlotId.
 * Mutates slotTeamMap in place and returns it for chaining.
 */
export function propagateWinners(
  slotTeamMap: Map<string, TeamCode | null>,
  predictions: Predictions,
  roundSlots: typeof bracketSlots,
): Map<string, TeamCode | null> {
  const matchMap = new Map<
    string,
    {
      homeSlot: (typeof roundSlots)[0] | undefined;
      awaySlot: (typeof roundSlots)[0] | undefined;
    }
  >();

  for (const slot of roundSlots) {
    if (!slot.matchId) continue;
    const existing = matchMap.get(slot.matchId) ?? {
      homeSlot: undefined,
      awaySlot: undefined,
    };
    if (slot.position === 1) existing.homeSlot = slot;
    else existing.awaySlot = slot;
    matchMap.set(slot.matchId, existing);
  }

  for (const [matchId, { homeSlot, awaySlot }] of matchMap) {
    const homeTeam = homeSlot ? (slotTeamMap.get(homeSlot.id) ?? null) : null;
    const awayTeam = awaySlot ? (slotTeamMap.get(awaySlot.id) ?? null) : null;
    const winner = predictions[matchId]?.winner ?? null;

    if (!winner) continue;

    const winningSlot =
      winner === homeTeam ? homeSlot : winner === awayTeam ? awaySlot : null;

    if (winningSlot?.nextSlotId) {
      slotTeamMap.set(winningSlot.nextSlotId, winner);
    }

    if (matchId === "sf-1") {
      const loser = getMatchLoser(homeTeam, awayTeam, winner);
      if (loser) slotTeamMap.set("3RD-01", loser);
    }
    if (matchId === "sf-2") {
      const loser = getMatchLoser(homeTeam, awayTeam, winner);
      if (loser) slotTeamMap.set("3RD-02", loser);
    }
  }

  return slotTeamMap;
}

/**
 * Resolve all bracket matches from R32 through to Final.
 * Uses predictions to determine winners and advance them via nextSlotId.
 */
export function resolveFullBracket(
  predictions: Predictions,
  sourceMatches: readonly Match[] = defaultMatches,
  locale: Locale = defaultLocale,
): ResolvedBracketMatch[] {
  const slotTeamMap = resolveR32Teams(sourceMatches);
  const resolvedMatches: ResolvedBracketMatch[] = [];
  const fixtureMap = buildKnockoutFixtureMap(sourceMatches);
  const stages = getMessages(locale).stages;

  const roundLabels: Record<number, string> = {
    1: stages.r32Long,
    2: stages.r16Long,
    3: stages.qfLong,
    4: stages.sfLong,
    5: `${stages.final} / ${stages.third_place}`,
  };

  const rounds = [1, 2, 3, 4, 5];

  for (const round of rounds) {
    const roundSlots = bracketSlots.filter((s) => s.round === round);
    propagateWinners(slotTeamMap, predictions, roundSlots);

    const matchMap = new Map<
      string,
      {
        homeSlot: (typeof roundSlots)[0] | undefined;
        awaySlot: (typeof roundSlots)[0] | undefined;
      }
    >();

    for (const slot of roundSlots) {
      if (!slot.matchId) continue;
      const existing = matchMap.get(slot.matchId) ?? {
        homeSlot: undefined,
        awaySlot: undefined,
      };
      if (slot.position === 1) existing.homeSlot = slot;
      else existing.awaySlot = slot;
      matchMap.set(slot.matchId, existing);
    }

    for (const [matchId, { homeSlot, awaySlot }] of matchMap) {
      const homeTeam = homeSlot
        ? (slotTeamMap.get(homeSlot.id) ?? null)
        : null;
      const awayTeam = awaySlot
        ? (slotTeamMap.get(awaySlot.id) ?? null)
        : null;

      const pred = predictions[matchId];
      const winner = pred?.winner ?? null;

      let label = "";
      if (round === 5) {
        label = matchId === "final" ? stages.final : stages.third_place;
      } else {
        label = roundLabels[round] ?? "";
      }

      resolvedMatches.push({
        matchId,
        round,
        homeTeam,
        awayTeam,
        nextSlotId: homeSlot?.nextSlotId ?? awaySlot?.nextSlotId ?? null,
        label,
        fixture: fixtureMap.get(matchId),
      });
    }
  }

  return resolvedMatches;
}

/** Get R32 team assignments for a specific bracket slot */
export function getTeamForBracketSlot(
  slotId: string,
  sourceMatches: readonly Match[] = defaultMatches,
): TeamCode | null {
  const r32Teams = resolveR32Teams(sourceMatches);
  return r32Teams.get(slotId) ?? null;
}

/** Get the qualifying match label for a bracket slot (e.g. "1º GRP A") */
export function getBracketSlotLabel(
  slotId: string,
  locale: Locale = defaultLocale,
): string {
  const slot = bracketSlots.find((s) => s.id === slotId);
  if (!slot) return "";

  const m = getMessages(locale);

  if (slot.round === 1) {
    const idx = bracketSlots.indexOf(slot);
    const pairIdx = Math.floor(idx / 4);

    if (pairIdx < GROUP_PAIRS.length) {
      const groupPair = GROUP_PAIRS[pairIdx];
      if (!groupPair) return "";

      const [groupOdd, groupEven] = groupPair;
      const posInPair = idx % 4;

      if (posInPair === 0) {
        return formatMessage(m.bracket.r32Labels.first, { group: `GRP ${groupOdd}` });
      }
      if (posInPair === 1) {
        return formatMessage(m.bracket.r32Labels.second, { group: `GRP ${groupEven}` });
      }
      if (posInPair === 2) {
        return formatMessage(m.bracket.r32Labels.first, { group: `GRP ${groupEven}` });
      }
      if (posInPair === 3) {
        return formatMessage(m.bracket.r32Labels.second, { group: `GRP ${groupOdd}` });
      }
    }

    return m.common.thirdBest;
  }

  return "";
}
