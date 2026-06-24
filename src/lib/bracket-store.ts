// ---------------------------------------------------------------------------
// WC26 – Bracket Prediction Store (localStorage)
// ---------------------------------------------------------------------------

import type { TeamCode, BracketPrediction, BracketPredictionEntry } from "@/types/wc26";

export type MatchPrediction = BracketPredictionEntry;
export type BracketPredictions = BracketPrediction;

/**
 * Tracks which teams the user assigned to each R32 slot.
 * key: match id like "R32-01", value: the TeamCodes selected to occupy the slot.
 */
export interface R32TeamAssignment {
  homeTeam: TeamCode | null;
  awayTeam: TeamCode | null;
}

export interface SavedBracket {
  id: string;
  predictions: BracketPredictions;
  /** R32 team slot selections — only for round 1 matches */
  r32Teams: Record<string, R32TeamAssignment>;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "wc26-bracket-predictions";
const BRACKET_ID_KEY = "wc26-bracket-id";

function generateId(): string {
  return `bracket-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isClient(): boolean {
  return typeof window !== "undefined";
}

function getSaved(): SavedBracket | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedBracket;
  } catch {
    return null;
  }
}

function persist(saved: SavedBracket): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // localStorage not available
  }
}

/** Load predictions from localStorage */
export function getPredictions(): BracketPredictions {
  return getSaved()?.predictions ?? {};
}

/** Load R32 team assignments */
export function getR32Teams(): Record<string, R32TeamAssignment> {
  return getSaved()?.r32Teams ?? {};
}

function touchSaved(saved: SavedBracket): SavedBracket {
  saved.updatedAt = new Date().toISOString();
  if (!saved.r32Teams) saved.r32Teams = {};
  return saved;
}

function createEmptySaved(): SavedBracket {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    predictions: {},
    r32Teams: {},
    createdAt: now,
    updatedAt: now,
  };
}

/** Save a prediction for a single match */
export function savePrediction(
  matchId: string,
  prediction: MatchPrediction,
): void {
  if (!isClient()) return;
  const saved = touchSaved(getSaved() ?? createEmptySaved());
  saved.predictions[matchId] = prediction;
  persist(saved);
  localStorage.setItem(BRACKET_ID_KEY, saved.id);
}

/** Save R32 team assignments for a specific match */
export function saveR32Teams(
  matchId: string,
  assignment: R32TeamAssignment,
): void {
  if (!isClient()) return;
  const saved = touchSaved(getSaved() ?? createEmptySaved());
  saved.r32Teams[matchId] = assignment;
  persist(saved);
  localStorage.setItem(BRACKET_ID_KEY, saved.id);
}

/** Replace the entire bracket (e.g. after loading from server). */
export function saveSavedBracket(saved: SavedBracket): void {
  if (!isClient()) return;
  const normalized = {
    ...saved,
    r32Teams: saved.r32Teams ?? {},
    predictions: saved.predictions ?? {},
    updatedAt: new Date().toISOString(),
  };
  persist(normalized);
  localStorage.setItem(BRACKET_ID_KEY, normalized.id);
}

/** Get the unique bracket ID */
export function getBracketId(): string | null {
  if (!isClient()) return null;
  try {
    return localStorage.getItem(BRACKET_ID_KEY);
  } catch {
    return null;
  }
}

/** Get the full saved bracket */
export function getSavedBracket(): SavedBracket | null {
  return getSaved();
}

/** Reset/clear all predictions and team selections */
export function resetPredictions(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BRACKET_ID_KEY);
  } catch {
    // ignore
  }
}

/** Count how many matches have predictions */
export function predictionCount(): number {
  return Object.keys(getPredictions()).length;
}
