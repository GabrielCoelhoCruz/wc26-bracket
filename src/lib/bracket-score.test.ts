import { describe, expect, it } from "vitest"
import { calculateScore, DEFAULT_WEIGHTS } from "@/lib/bracket-score"
import type { Match } from "@/types/wc26"

const finishedMatch: Match = {
  id: "test-1",
  stage: "group",
  group: "A",
  homeTeam: "BRA",
  awayTeam: "ARG",
  date: "2026-06-20",
  time: "18:00",
  stadium: "Test Stadium",
  city: "Test City",
  status: "finished",
  homeScore: 2,
  awayScore: 1,
}

describe("calculateScore", () => {
  it("awards exact score points when winner and scoreline match", () => {
    const result = calculateScore(
      {
        "test-1": { winner: "BRA", homeScore: 2, awayScore: 1 },
      },
      [finishedMatch],
    )

    expect(result.total).toBe(DEFAULT_WEIGHTS.exactScore)
    expect(result.breakdown[0]?.scoreExact).toBe(true)
    expect(result.breakdown[0]?.winnerCorrect).toBe(true)
  })

  it("awards winner-only points when scoreline differs", () => {
    const result = calculateScore(
      {
        "test-1": { winner: "BRA", homeScore: 1, awayScore: 0 },
      },
      [finishedMatch],
    )

    expect(result.total).toBe(DEFAULT_WEIGHTS.winner)
    expect(result.breakdown[0]?.winnerCorrect).toBe(true)
    expect(result.breakdown[0]?.scoreExact).toBe(false)
  })

  it("skips unfinished matches", () => {
    const pending: Match = { ...finishedMatch, id: "test-2", status: "scheduled" }
    const result = calculateScore(
      { "test-2": { winner: "BRA" } },
      [pending],
    )

    expect(result.total).toBe(0)
    expect(result.breakdown).toHaveLength(0)
  })
})
