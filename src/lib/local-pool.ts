// ---------------------------------------------------------------------------
// WC26 – Local Bolão Store
// Browser-local pool for comparing brackets
// ---------------------------------------------------------------------------

import type { BracketPrediction } from "@/types/wc26";
import { getTeam } from "@/data/teams";
import { calculateScore } from "@/lib/bracket-score";
import type { Match } from "@/types/wc26";
import {
  defaultLocale,
  formatPoolMatchLabel,
  getTeamName,
  type Locale,
} from "@/lib/i18n";

export interface PoolParticipant {
  id: string;
  name: string;
  predictions: BracketPrediction;
  score: number;
  shareHash?: string;
  addedAt: string;
}

export interface LocalPool {
  id: string;
  name: string;
  participants: PoolParticipant[];
  createdAt: string;
}

export interface BracketComparison {
  matchId: string;
  label: string;
  agreements: number;
  disagreements: number;
  picks: { name: string; winner: string; winnerLabel: string }[];
}

const STORAGE_KEY = "wc26-local-pool";

function isClient(): boolean {
  return typeof window !== "undefined";
}

function loadPool(): LocalPool | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalPool;
  } catch {
    return null;
  }
}

function savePool(pool: LocalPool): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pool));
  } catch {
    // ignore
  }
}

export function getLocalPool(): LocalPool | null {
  return loadPool();
}

export function createLocalPool(name: string): LocalPool {
  const pool: LocalPool = {
    id: `pool-${Date.now()}`,
    name,
    participants: [],
    createdAt: new Date().toISOString(),
  };
  savePool(pool);
  return pool;
}

export function ensureLocalPool(name = "Meu Bolão WC26"): LocalPool {
  const existing = loadPool();
  if (existing) return existing;
  return createLocalPool(name);
}

export function addPoolParticipant(
  name: string,
  predictions: BracketPrediction,
  resultMatches: Match[],
  shareHash?: string,
): PoolParticipant | null {
  const pool = ensureLocalPool();
  const scoreResult = calculateScore(predictions, resultMatches);
  const participant: PoolParticipant = {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    predictions,
    score: scoreResult.total,
    shareHash,
    addedAt: new Date().toISOString(),
  };
  pool.participants.push(participant);
  savePool(pool);
  return participant;
}

export function removePoolParticipant(id: string): void {
  const pool = loadPool();
  if (!pool) return;
  pool.participants = pool.participants.filter((p) => p.id !== id);
  savePool(pool);
}

export function recalculatePoolScores(resultMatches: Match[]): LocalPool | null {
  const pool = loadPool();
  if (!pool) return null;
  pool.participants = pool.participants.map((p) => ({
    ...p,
    score: calculateScore(p.predictions, resultMatches).total,
  }));
  savePool(pool);
  return pool;
}

const KEY_MATCHES = ["final", "sf-1", "sf-2", "qf-1", "qf-2", "qf-3", "qf-4"];

export function comparePoolBrackets(
  pool: LocalPool,
  locale: Locale = defaultLocale,
): BracketComparison[] {
  if (pool.participants.length < 2) return [];

  const allMatchIds = new Set<string>();
  for (const p of pool.participants) {
    for (const id of Object.keys(p.predictions)) {
      allMatchIds.add(id);
    }
  }

  const sortedIds = Array.from(allMatchIds).sort((a, b) => {
    const aKey = KEY_MATCHES.indexOf(a);
    const bKey = KEY_MATCHES.indexOf(b);
    if (aKey >= 0 && bKey >= 0) return aKey - bKey;
    if (aKey >= 0) return -1;
    if (bKey >= 0) return 1;
    return a.localeCompare(b);
  });

  return sortedIds.map((matchId) => {
    const picks = pool.participants.map((p) => {
      const winner = p.predictions[matchId]?.winner ?? "";
      const team = getTeam(winner);
      return {
        name: p.name,
        winner,
        winnerLabel: team ? `${team.flag} ${getTeamName(team, locale)}` : winner || "—",
      };
    });

    const winners = picks.map((p) => p.winner).filter(Boolean);
    const uniqueWinners = new Set(winners);

    return {
      matchId,
      label: formatPoolMatchLabel(matchId, locale),
      agreements: uniqueWinners.size === 1 ? winners.length : 0,
      disagreements: uniqueWinners.size > 1 ? uniqueWinners.size - 1 : 0,
      picks,
    };
  });
}

export function getChampionPick(
  predictions: BracketPrediction,
): string | null {
  return predictions["final"]?.winner ?? null;
}
