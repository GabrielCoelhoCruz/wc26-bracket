// ---------------------------------------------------------------------------
// WC26 – Local Ranking Store
// Browser-local leaderboard (no server sync)
// ---------------------------------------------------------------------------

import type { BracketPrediction } from "@/types/wc26";
import { calculateScore, type ScoreResult } from "@/lib/bracket-score";
import type { Match } from "@/types/wc26";

export interface RankingEntry {
  id: string;
  name: string;
  predictions: BracketPrediction;
  score: number;
  breakdown?: ScoreResult;
  importedFrom?: string;
  addedAt: string;
}

const STORAGE_KEY = "wc26-local-ranking";
const OWNER_KEY = "wc26-owner-name";

function isClient(): boolean {
  return typeof window !== "undefined";
}

function loadEntries(): RankingEntry[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RankingEntry[];
  } catch {
    return [];
  }
}

function saveEntries(entries: RankingEntry[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

export function getOwnerName(): string {
  if (!isClient()) return "";
  try {
    return localStorage.getItem(OWNER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setOwnerName(name: string): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(OWNER_KEY, name.trim());
  } catch {
    // ignore
  }
}

export function getRankingEntries(): RankingEntry[] {
  return loadEntries().sort((a, b) => b.score - a.score);
}

export function upsertRankingEntry(
  entry: Omit<RankingEntry, "id" | "addedAt"> & { id?: string },
  resultMatches: Match[],
): RankingEntry {
  const scoreResult = calculateScore(entry.predictions, resultMatches);
  const full: RankingEntry = {
    id: entry.id ?? `rank-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: entry.name,
    predictions: entry.predictions,
    score: scoreResult.total,
    breakdown: scoreResult,
    importedFrom: entry.importedFrom,
    addedAt: new Date().toISOString(),
  };

  const existing = loadEntries();
  const idx = existing.findIndex((e) => e.id === full.id);
  if (idx >= 0) {
    existing[idx] = full;
  } else {
    existing.push(full);
  }
  saveEntries(existing);
  return full;
}

export function removeRankingEntry(id: string): void {
  saveEntries(loadEntries().filter((e) => e.id !== id));
}

export function recalculateAllScores(resultMatches: Match[]): RankingEntry[] {
  const updated = loadEntries().map((entry) => {
    const scoreResult = calculateScore(entry.predictions, resultMatches);
    return {
      ...entry,
      score: scoreResult.total,
      breakdown: scoreResult,
    };
  });
  saveEntries(updated);
  return updated.sort((a, b) => b.score - a.score);
}

export function importFromShare(
  name: string,
  predictions: BracketPrediction,
  hash: string,
  resultMatches: Match[],
): RankingEntry {
  return upsertRankingEntry(
    { name, predictions, importedFrom: hash, score: 0 },
    resultMatches,
  );
}
