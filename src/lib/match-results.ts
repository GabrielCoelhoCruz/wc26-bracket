// ---------------------------------------------------------------------------
// WC26 – Match Results Merger
// Combines static seed data with live scores from worldcup26.ir
// ---------------------------------------------------------------------------

import { matches as staticMatches } from "@/data/matches"
import type { Match } from "@/types/wc26"

/** Merge live API results into static matches, preferring finished API scores */
export function mergeMatchResults(
  base: readonly Match[] = staticMatches,
  apiMatches: Match[] = [],
): Match[] {
  const apiByTeams = new Map<string, Match>()
  for (const m of apiMatches) {
    if (m.homeTeam !== "TBD" && m.awayTeam !== "TBD") {
      apiByTeams.set(`${m.homeTeam}-${m.awayTeam}`, m)
    }
  }

  return base.map((m) => {
    const api = apiByTeams.get(`${m.homeTeam}-${m.awayTeam}`)
    if (!api) return { ...m }

    if (api.status === "scheduled") {
      if (m.status === "live") {
        return {
          ...m,
          status: "scheduled" as const,
          elapsed: undefined,
          homeScore: undefined,
          awayScore: undefined,
        }
      }
      return { ...m }
    }

    return {
      ...m,
      homeScore: api.homeScore,
      awayScore: api.awayScore,
      status: api.status,
      elapsed: api.elapsed,
    }
  })
}

/** Fetch merged results: static + optional live overlay from worldcup26.ir */
export async function fetchMergedResults(
  localOverrides: Match[] = [],
): Promise<{ matches: Match[]; source: "api" | "static" }> {
  try {
    const res = await fetch("/api/matches")
    if (!res.ok) throw new Error("API unavailable")
    const data = (await res.json()) as { matches?: Match[]; source?: string }
    const apiMatches = data.matches ?? []
    const merged = mergeMatchResults(staticMatches, apiMatches)
    const source = data.source === "worldcup26.ir" || data.source === "projetoCopa-supabase"
      ? "api"
      : "static"
    return { matches: applyLocalOverrides(merged, localOverrides), source }
  } catch {
    return {
      matches: applyLocalOverrides([...staticMatches], localOverrides),
      source: "static",
    }
  }
}

function applyLocalOverrides(base: Match[], overrides: Match[]): Match[] {
  if (overrides.length === 0) return base
  const overrideMap = new Map(overrides.map((m) => [m.id, m]))
  return base.map((m) => overrideMap.get(m.id) ?? m)
}

/** Apply user group scores from localStorage onto match list */
export function applyGroupScoresToMatches(
  base: readonly Match[],
  groupScores: Record<
    string,
    { homeScore: number; awayScore: number; finished: boolean }
  >,
): Match[] {
  return base.map((m) => {
    const score = groupScores[m.id]
    if (score?.finished) {
      return {
        ...m,
        homeScore: score.homeScore,
        awayScore: score.awayScore,
        status: "finished" as const,
      }
    }
    return m
  })
}
