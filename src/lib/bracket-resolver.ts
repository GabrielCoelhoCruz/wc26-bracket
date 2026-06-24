// ---------------------------------------------------------------------------
// WC26 – Bracket Resolver
// Maps group qualifiers to R32 bracket slots and advances winners
// ---------------------------------------------------------------------------

import { matches } from "@/data/matches";
import { bracketSlots } from "@/data/knockout-bracket";
import { getGroupQualifiers } from "@/lib/group-standings";
import type { TeamCode } from "@/types/wc26";

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
  ["M", "N"],
  ["O", "P"],
];

export interface ResolvedBracketSlot {
  slotId: string;
  matchId: string;
  team: TeamCode | null;
  position: 1 | 2;
  round: number;
  nextSlotId: string | null;
}

export interface ResolvedBracketMatch {
  matchId: string;
  round: number;
  homeTeam: TeamCode | null;
  awayTeam: TeamCode | null;
  nextSlotId: string | null;
  label: string;
}

/**
 * Resolve which teams occupy each R32 slot based on group results.
 *
 * Pair i (0-indexed) → R32 match indices [i*2, i*2+1]
 * Slot indices within a pair:  [i*4, i*4+1, i*4+2, i*4+3]
 *   slot[i*4]     = R32-{2i+1}: pos 1 (1st odd group)
 *   slot[i*4+1]   = R32-{2i+1}: pos 2 (2nd even group)
 *   slot[i*4+2]   = R32-{2i+2}: pos 1 (1st even group)
 *   slot[i*4+3]   = R32-{2i+2}: pos 2 (2nd odd group)
 */
export function resolveR32Teams(): Map<string, TeamCode | null> {
  const slotTeams = new Map<string, TeamCode | null>();

  for (let i = 0; i < GROUP_PAIRS.length; i++) {
    const [groupOdd, groupEven] = GROUP_PAIRS[i];
    const oddQual = getGroupQualifiers(groupOdd);
    const evenQual = getGroupQualifiers(groupEven);

    // Match A: 1st(odd) vs 2nd(even)
    // Slot indices in bracketSlots array: [i*4, i*4+1, i*4+2, i*4+3]
    const slotIdxBase = i * 4;

    // R32-{2i+1} slots: baseMatchIdx = i * 2
    const r32SlotsA = bracketSlots.slice(slotIdxBase, slotIdxBase + 2);
    if (r32SlotsA[0]) slotTeams.set(r32SlotsA[0].id, oddQual.first);
    if (r32SlotsA[1]) slotTeams.set(r32SlotsA[1].id, evenQual.second);

    // R32-{2i+2} slots
    const r32SlotsB = bracketSlots.slice(slotIdxBase + 2, slotIdxBase + 4);
    if (r32SlotsB[0]) slotTeams.set(r32SlotsB[0].id, evenQual.first);
    if (r32SlotsB[1]) slotTeams.set(r32SlotsB[1].id, oddQual.second);
  }

  return slotTeams;
}

/**
 * Resolve all bracket matches from R32 through to Final.
 * Uses predictions to determine winners and advance them.
 */
export function resolveFullBracket(
  predictions: Record<string, { winner: TeamCode; homeScore?: number; awayScore?: number }>,
): ResolvedBracketMatch[] {
  const r32Teams = resolveR32Teams();
  const resolvedMatches: ResolvedBracketMatch[] = [];
  const matchWinners = new Map<string, TeamCode | null>();

  // Build a quick lookup for slot → team
  const slotTeamMap = new Map<string, TeamCode | null>(r32Teams);

  // Group slots by round
  const rounds = [1, 2, 3, 4, 5];
  const roundLabels: Record<number, string> = {
    1: "32 Avos de Final",
    2: "16 Avos de Final",
    3: "Quartas de Final",
    4: "Semifinal",
    5: "Final / 3º Lugar",
  };

  for (const round of rounds) {
    const roundSlots = bracketSlots.filter((s) => s.round === round);

    // Group slots by matchId
    const matchMap = new Map<string, { homeSlot: typeof roundSlots[0]; awaySlot: typeof roundSlots[0] }>();
    for (const slot of roundSlots) {
      if (!slot.matchId) continue;
      const existing = matchMap.get(slot.matchId) ?? { homeSlot: undefined as any, awaySlot: undefined as any };
      if (slot.position === 1) existing.homeSlot = slot;
      else existing.awaySlot = slot;
      matchMap.set(slot.matchId, existing);
    }

    for (const [matchId, { homeSlot, awaySlot }] of matchMap) {
      // Determine teams for this slot
      let homeTeam: TeamCode | null = null;
      let awayTeam: TeamCode | null = null;

      if (round === 1) {
        // Round 1: teams come from group stage
        homeTeam = homeSlot ? slotTeamMap.get(homeSlot.id) ?? null : null;
        awayTeam = awaySlot ? slotTeamMap.get(awaySlot.id) ?? null : null;
      } else {
        // Subsequent rounds: winners from previous round
        const homeWinner = homeSlot ? matchWinners.get(homeSlot.id) ?? null : null;
        const awayWinner = awaySlot ? matchWinners.get(awaySlot.id) ?? null : null;

        // For the semi-finals → final/3rd place transition
        if (homeSlot && homeSlot.nextSlotId === "FINAL-01" && matchId === "sf-1") {
          // SF-1 winner goes to Final slot 1; loser would go to 3rd place slot 1
          homeTeam = homeWinner;
          awayTeam = awayWinner;
        } else {
          homeTeam = homeWinner;
          awayTeam = awayWinner;
        }
      }

      // Check prediction for this match
      const pred = predictions[matchId];
      let winner: TeamCode | null = null;

      if (pred) {
        winner = pred.winner;
      } else if (homeTeam && awayTeam) {
        // No prediction — pick the team with higher rating
        // We'll use the team code directly as a fallback
        // (ratings aren't available here, so we stay null)
      }

      // Store the winner for advancing
      if (winner && homeSlot) {
        // Also store under the slot id so feeder slots can find it
        matchWinners.set(homeSlot.id, winner);
      }
      if (winner && awaySlot) {
        matchWinners.set(awaySlot.id, winner);
      }

      // Also store under matchId so the next round can reference it
      if (winner) {
        matchWinners.set(matchId, winner);
      }

      // Build a label
      let label = "";
      if (round === 5) {
        if (matchId === "final") label = "Final";
        else label = "3º Lugar";
      } else {
        label = `${roundLabels[round]}`;
      }

      resolvedMatches.push({
        matchId,
        round,
        homeTeam,
        awayTeam,
        nextSlotId: homeSlot?.nextSlotId ?? awaySlot?.nextSlotId ?? null,
        label,
      });
    }
  }

  return resolvedMatches;
}

/**
 * Get R32 team assignments for a specific bracket slot based on group results.
 * Returns the team code or null if undetermined.
 */
export function getTeamForBracketSlot(slotId: string): TeamCode | null {
  const r32Teams = resolveR32Teams();
  return r32Teams.get(slotId) ?? null;
}

/**
 * Get the qualifying match label for a bracket slot (e.g. "1º GRP A" or "2º GRP B")
 */
export function getBracketSlotLabel(slotId: string): string {
  const slot = bracketSlots.find((s) => s.id === slotId);
  if (!slot) return "";

  // For R32, find which group pair this belongs to
  if (slot.round === 1) {
    const idx = bracketSlots.indexOf(slot);
    const pairIdx = Math.floor(idx / 4);
    const posInPair = idx % 4;
    const groupPair = GROUP_PAIRS[pairIdx];
    if (!groupPair) return "";

    const [groupOdd, groupEven] = groupPair;

    // Positions within a pair of 4 slots:
    // 0: 1st odd group, 1: 2nd even group, 2: 1st even group, 3: 2nd odd group
    if (posInPair === 0) return `1º GRP ${groupOdd}`;
    if (posInPair === 1) return `2º GRP ${groupEven}`;
    if (posInPair === 2) return `1º GRP ${groupEven}`;
    if (posInPair === 3) return `2º GRP ${groupOdd}`;
  }

  return "";
}
