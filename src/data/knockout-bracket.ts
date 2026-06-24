import type { BracketSlot } from "@/types/wc26";

/**
 * All 64 BracketSlot entries for the knockout bracket tree.
 *
 * Round tree:
 *   R32 (16 matches, 32 slots) → R16 (8 matches, 16 slots)
 *   → QF (4 matches, 8 slots) → SF (2 matches, 4 slots)
 *   → 3rd-place (1 match, 2 slots) / Final (1 match, 2 slots)
 *
 * Each slot:
 *   - id         unique slot identifier
 *   - matchId    which match this slot belongs to
 *   - position   1 = home team, 2 = away team
 *   - round      1=R32, 2=R16, 3=QF, 4=SF, 5=final/3rd-place
 *   - nextSlotId where the winner goes (the slot in the next round)
 */
export const bracketSlots: readonly BracketSlot[] = [
  // ═══════════════════════════════════════════
  // ROUND 1 — Round of 32  (round = 1)
  // 16 matches, 32 slots
  // Winners advance to Round of 16 (slots R16-01…R16-16)
  // ═══════════════════════════════════════════
  // Match 1 → R16-01
  { id: "R32-01", matchId: "r32-1",  position: 1, round: 1, nextSlotId: "R16-01" },
  { id: "R32-02", matchId: "r32-1",  position: 2, round: 1, nextSlotId: "R16-01" },
  // Match 2 → R16-02
  { id: "R32-03", matchId: "r32-2",  position: 1, round: 1, nextSlotId: "R16-02" },
  { id: "R32-04", matchId: "r32-2",  position: 2, round: 1, nextSlotId: "R16-02" },
  // Match 3 → R16-03
  { id: "R32-05", matchId: "r32-3",  position: 1, round: 1, nextSlotId: "R16-03" },
  { id: "R32-06", matchId: "r32-3",  position: 2, round: 1, nextSlotId: "R16-03" },
  // Match 4 → R16-04
  { id: "R32-07", matchId: "r32-4",  position: 1, round: 1, nextSlotId: "R16-04" },
  { id: "R32-08", matchId: "r32-4",  position: 2, round: 1, nextSlotId: "R16-04" },
  // Match 5 → R16-05
  { id: "R32-09", matchId: "r32-5",  position: 1, round: 1, nextSlotId: "R16-05" },
  { id: "R32-10", matchId: "r32-5",  position: 2, round: 1, nextSlotId: "R16-05" },
  // Match 6 → R16-06
  { id: "R32-11", matchId: "r32-6",  position: 1, round: 1, nextSlotId: "R16-06" },
  { id: "R32-12", matchId: "r32-6",  position: 2, round: 1, nextSlotId: "R16-06" },
  // Match 7 → R16-07
  { id: "R32-13", matchId: "r32-7",  position: 1, round: 1, nextSlotId: "R16-07" },
  { id: "R32-14", matchId: "r32-7",  position: 2, round: 1, nextSlotId: "R16-07" },
  // Match 8 → R16-08
  { id: "R32-15", matchId: "r32-8",  position: 1, round: 1, nextSlotId: "R16-08" },
  { id: "R32-16", matchId: "r32-8",  position: 2, round: 1, nextSlotId: "R16-08" },
  // Match 9 → R16-09
  { id: "R32-17", matchId: "r32-9",  position: 1, round: 1, nextSlotId: "R16-09" },
  { id: "R32-18", matchId: "r32-9",  position: 2, round: 1, nextSlotId: "R16-09" },
  // Match 10 → R16-10
  { id: "R32-19", matchId: "r32-10", position: 1, round: 1, nextSlotId: "R16-10" },
  { id: "R32-20", matchId: "r32-10", position: 2, round: 1, nextSlotId: "R16-10" },
  // Match 11 → R16-11
  { id: "R32-21", matchId: "r32-11", position: 1, round: 1, nextSlotId: "R16-11" },
  { id: "R32-22", matchId: "r32-11", position: 2, round: 1, nextSlotId: "R16-11" },
  // Match 12 → R16-12
  { id: "R32-23", matchId: "r32-12", position: 1, round: 1, nextSlotId: "R16-12" },
  { id: "R32-24", matchId: "r32-12", position: 2, round: 1, nextSlotId: "R16-12" },
  // Match 13 → R16-13
  { id: "R32-25", matchId: "r32-13", position: 1, round: 1, nextSlotId: "R16-13" },
  { id: "R32-26", matchId: "r32-13", position: 2, round: 1, nextSlotId: "R16-13" },
  // Match 14 → R16-14
  { id: "R32-27", matchId: "r32-14", position: 1, round: 1, nextSlotId: "R16-14" },
  { id: "R32-28", matchId: "r32-14", position: 2, round: 1, nextSlotId: "R16-14" },
  // Match 15 → R16-15
  { id: "R32-29", matchId: "r32-15", position: 1, round: 1, nextSlotId: "R16-15" },
  { id: "R32-30", matchId: "r32-15", position: 2, round: 1, nextSlotId: "R16-15" },
  // Match 16 → R16-16
  { id: "R32-31", matchId: "r32-16", position: 1, round: 1, nextSlotId: "R16-16" },
  { id: "R32-32", matchId: "r32-16", position: 2, round: 1, nextSlotId: "R16-16" },

  // ═══════════════════════════════════════════
  // ROUND 2 — Round of 16  (round = 2)
  // 8 matches, 16 slots
  // Winners advance to Quarter-finals (slots QF-01…QF-08)
  // ═══════════════════════════════════════════
  // Match 1 → QF-01
  { id: "R16-01", matchId: "r16-1", position: 1, round: 2, nextSlotId: "QF-01" },
  { id: "R16-02", matchId: "r16-1", position: 2, round: 2, nextSlotId: "QF-01" },
  // Match 2 → QF-02
  { id: "R16-03", matchId: "r16-2", position: 1, round: 2, nextSlotId: "QF-02" },
  { id: "R16-04", matchId: "r16-2", position: 2, round: 2, nextSlotId: "QF-02" },
  // Match 3 → QF-03
  { id: "R16-05", matchId: "r16-3", position: 1, round: 2, nextSlotId: "QF-03" },
  { id: "R16-06", matchId: "r16-3", position: 2, round: 2, nextSlotId: "QF-03" },
  // Match 4 → QF-04
  { id: "R16-07", matchId: "r16-4", position: 1, round: 2, nextSlotId: "QF-04" },
  { id: "R16-08", matchId: "r16-4", position: 2, round: 2, nextSlotId: "QF-04" },
  // Match 5 → QF-05
  { id: "R16-09", matchId: "r16-5", position: 1, round: 2, nextSlotId: "QF-05" },
  { id: "R16-10", matchId: "r16-5", position: 2, round: 2, nextSlotId: "QF-05" },
  // Match 6 → QF-06
  { id: "R16-11", matchId: "r16-6", position: 1, round: 2, nextSlotId: "QF-06" },
  { id: "R16-12", matchId: "r16-6", position: 2, round: 2, nextSlotId: "QF-06" },
  // Match 7 → QF-07
  { id: "R16-13", matchId: "r16-7", position: 1, round: 2, nextSlotId: "QF-07" },
  { id: "R16-14", matchId: "r16-7", position: 2, round: 2, nextSlotId: "QF-07" },
  // Match 8 → QF-08
  { id: "R16-15", matchId: "r16-8", position: 1, round: 2, nextSlotId: "QF-08" },
  { id: "R16-16", matchId: "r16-8", position: 2, round: 2, nextSlotId: "QF-08" },

  // ═══════════════════════════════════════════
  // ROUND 3 — Quarter-finals  (round = 3)
  // 4 matches, 8 slots
  // Winners advance to Semi-finals (slots SF-01…SF-04)
  // ═══════════════════════════════════════════
  { id: "QF-01", matchId: "qf-1", position: 1, round: 3, nextSlotId: "SF-01" },
  { id: "QF-02", matchId: "qf-1", position: 2, round: 3, nextSlotId: "SF-01" },
  { id: "QF-03", matchId: "qf-2", position: 1, round: 3, nextSlotId: "SF-02" },
  { id: "QF-04", matchId: "qf-2", position: 2, round: 3, nextSlotId: "SF-02" },
  { id: "QF-05", matchId: "qf-3", position: 1, round: 3, nextSlotId: "SF-03" },
  { id: "QF-06", matchId: "qf-3", position: 2, round: 3, nextSlotId: "SF-03" },
  { id: "QF-07", matchId: "qf-4", position: 1, round: 3, nextSlotId: "SF-04" },
  { id: "QF-08", matchId: "qf-4", position: 2, round: 3, nextSlotId: "SF-04" },

  // ═══════════════════════════════════════════
  // ROUND 4 — Semi-finals  (round = 4)
  // 2 matches, 4 slots
  // Winners → Final; Losers → 3rd Place
  // ═══════════════════════════════════════════
  { id: "SF-01", matchId: "sf-1", position: 1, round: 4, nextSlotId: "FINAL-01" },
  { id: "SF-02", matchId: "sf-1", position: 2, round: 4, nextSlotId: "FINAL-01" },
  { id: "SF-03", matchId: "sf-2", position: 1, round: 4, nextSlotId: "FINAL-02" },
  { id: "SF-04", matchId: "sf-2", position: 2, round: 4, nextSlotId: "FINAL-02" },

  // ═══════════════════════════════════════════
  // ROUND 5 — Final & Third Place  (round = 5)
  // Winners of SF → Final; Losers of SF → 3rd Place
  // ═══════════════════════════════════════════
  { id: "3RD-01",    matchId: "third-place", position: 1, round: 5 },
  { id: "3RD-02",    matchId: "third-place", position: 2, round: 5 },
  { id: "FINAL-01",  matchId: "final",       position: 1, round: 5 },
  { id: "FINAL-02",  matchId: "final",       position: 2, round: 5 },
];

/** Lookup a bracket slot by its id */
export function getSlot(id: string): BracketSlot | undefined {
  return bracketSlots.find((s) => s.id === id);
}

/** Get all slots for a given round number */
export function slotsByRound(round: number): BracketSlot[] {
  return bracketSlots.filter((s) => s.round === round);
}

/** Get all slots that feed into a given slot (i.e. whose nextSlotId matches) */
export function feederSlots(slotId: string): BracketSlot[] {
  return bracketSlots.filter((s) => s.nextSlotId === slotId);
}
