// ---------------------------------------------------------------------------
// WC26 – Ranking score API
// POST /api/ranking – calculate score for predictions against live results
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { matches as defaultMatches } from "@/data/matches"
import { calculateScore } from "@/lib/bracket-score"
import type { BracketPrediction } from "@/types/wc26"

const predictionEntrySchema = z.object({
  winner: z.string().min(1).max(3),
  homeScore: z.number().int().min(0).optional(),
  awayScore: z.number().int().min(0).optional(),
})

const rankingRequestSchema = z.object({
  predictions: z.record(z.string().min(1), predictionEntrySchema),
  name: z.string().min(1).max(64).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = rankingRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 },
      )
    }

    const predictions = parsed.data.predictions as BracketPrediction
    const scoreResult = calculateScore(predictions, [...defaultMatches])

    const correctWinners = scoreResult.breakdown.filter((b) => b.winnerCorrect).length
    const exactScores = scoreResult.breakdown.filter((b) => b.scoreExact).length

    return NextResponse.json({
      name: parsed.data.name ?? "Anônimo",
      score: scoreResult.total,
      correctWinners,
      exactScores,
      breakdown: scoreResult.breakdown,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[api/ranking] POST failed", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    info: "Ranking is stored locally in the browser. POST predictions to calculate score.",
    scoring: { winner: 1, exactScore: 3 },
  })
}
