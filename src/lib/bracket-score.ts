// ---------------------------------------------------------------------------
// WC26 – Bracket Score Calculation
// ---------------------------------------------------------------------------

import type { Match } from "@/types/wc26";
import type { BracketPredictions } from "./bracket-store";

export interface ScoreBreakdown {
  matchId: string;
  winnerCorrect: boolean;
  scoreExact: boolean;
  points: number;
}

export interface ScoreResult {
  total: number;
  breakdown: ScoreBreakdown[];
}

export interface ScoringWeights {
  /** Points awarded for picking the correct winner */
  winner: number;
  /** Points awarded for an exact scoreline */
  exactScore: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  winner: 1,
  exactScore: 3,
};

function matchHasResult(match: Match): boolean {
  return (
    match.status === "finished" &&
    match.homeScore !== undefined &&
    match.awayScore !== undefined &&
    match.homeScore !== null &&
    match.awayScore !== null
  );
}

function determineWinner(homeScore: number, awayScore: number): "home" | "away" | null {
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return null; // draw is not possible in knockout, but handle gracefully
}

/**
 * Calculate score for a user's bracket predictions against actual match results.
 *
 * Scoring (configurable via `weights`):
 * - `winner` points for correct winner
 * - `exactScore` points for exact scoreline (includes the winner bonus by default)
 *
 * Only considers matches that are finished and have actual scores.
 */
export function calculateScore(
  predictions: BracketPredictions,
  matches: Match[],
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): ScoreResult {
  const breakdown: ScoreBreakdown[] = [];
  let total = 0;

  for (const match of matches) {
    if (!matchHasResult(match)) continue;

    const pred = predictions[match.id];
    if (!pred) continue;

    const actualHomeScore = match.homeScore as number;
    const actualAwayScore = match.awayScore as number;

    const actualWinner = determineWinner(actualHomeScore, actualAwayScore);
    let predictedWinner: "home" | "away" | null = null;

    if (pred.winner === match.homeTeam) {
      predictedWinner = "home";
    } else if (pred.winner === match.awayTeam) {
      predictedWinner = "away";
    }

    const winnerCorrect =
      actualWinner !== null &&
      predictedWinner !== null &&
      actualWinner === predictedWinner;

    const scoreExact =
      pred.homeScore !== undefined &&
      pred.awayScore !== undefined &&
      pred.homeScore !== null &&
      pred.awayScore !== null &&
      pred.homeScore === actualHomeScore &&
      pred.awayScore === actualAwayScore;

    let points = 0;
    if (scoreExact) {
      points += weights.exactScore;
    } else if (winnerCorrect) {
      points += weights.winner;
    }

    total += points;

    breakdown.push({
      matchId: match.id,
      winnerCorrect,
      scoreExact,
      points,
    });
  }

  return { total, breakdown };
}

/**
 * Get the predicted winner for a given match from predictions.
 */
export function getPredictedWinner(
  predictions: BracketPredictions,
  matchId: string,
): string | null {
  return predictions[matchId]?.winner ?? null;
}
