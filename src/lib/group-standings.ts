// ---------------------------------------------------------------------------
// WC26 – Group Standings Engine
// Calculates group tables from match results and determines qualifiers
// ---------------------------------------------------------------------------

import { matches as defaultMatches } from "@/data/matches";
import { getAllTeams, getTeam } from "@/data/teams";
import type { Match, TeamCode } from "@/types/wc26";

export interface GroupStandingRow {
  team: TeamCode;
  teamName: string;
  flag: string;
  flagUrl?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface GroupStanding {
  group: string;
  rows: GroupStandingRow[];
}

/** Get all unique group letters from the teams data */
export function getGroupLetters(): string[] {
  const groupSet = new Set<string>();
  for (const t of getAllTeams()) {
    if (t.group) groupSet.add(t.group);
  }
  return Array.from(groupSet).sort();
}

/** Get all teams in a given group */
export function getGroupTeams(group: string): TeamCode[] {
  return getAllTeams()
    .filter((t) => t.group === group)
    .map((t) => t.code as TeamCode);
}

/** Build standings for a single group */
export function getGroupStandings(
  group: string,
  sourceMatches: readonly Match[] = defaultMatches,
): GroupStandingRow[] {
  const groupTeams = getGroupTeams(group);
  const groupMatches = sourceMatches.filter(
    (m) => m.group === group && m.stage === "group",
  );

  const standings = new Map<
    TeamCode,
    {
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      points: number;
    }
  >();

  for (const code of groupTeams) {
    standings.set(code, {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    });
  }

  for (const match of groupMatches) {
    const home = match.homeTeam as TeamCode;
    const away = match.awayTeam as TeamCode;

    const homeRow = standings.get(home);
    const awayRow = standings.get(away);
    if (!homeRow || !awayRow) continue;

    if (match.status !== "finished") continue;
    if (match.homeScore === undefined || match.awayScore === undefined) continue;

    const homeScore = match.homeScore;
    const awayScore = match.awayScore;

    homeRow.played++;
    awayRow.played++;

    homeRow.goalsFor += homeScore;
    homeRow.goalsAgainst += awayScore;
    awayRow.goalsFor += awayScore;
    awayRow.goalsAgainst += homeScore;

    if (homeScore > awayScore) {
      homeRow.won++;
      homeRow.points += 3;
      awayRow.lost++;
    } else if (awayScore > homeScore) {
      awayRow.won++;
      awayRow.points += 3;
      homeRow.lost++;
    } else {
      homeRow.drawn++;
      awayRow.drawn++;
      homeRow.points += 1;
      awayRow.points += 1;
    }
  }

  return Array.from(standings.entries())
    .map(([code, data]) => {
      const team = getTeam(code);
      return {
        team: code,
        teamName: team?.namePt ?? code,
        flag: team?.flag ?? "",
        ...data,
        goalDifference: data.goalsFor - data.goalsAgainst,
      };
    })
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
}

/** Get all group standings */
export function getAllGroupStandings(
  sourceMatches: readonly Match[] = defaultMatches,
): GroupStanding[] {
  return getGroupLetters().map((group) => ({
    group,
    rows: getGroupStandings(group, sourceMatches),
  }));
}

/** Get the teams that qualify from a group (top 2) */
export function getGroupQualifiers(
  group: string,
  sourceMatches: readonly Match[] = defaultMatches,
): {
  first: TeamCode | null;
  second: TeamCode | null;
} {
  const rows = getGroupStandings(group, sourceMatches);
  const hasResults = rows.some((r) => r.played > 0);

  if (!hasResults) {
    const groupTeams = getGroupTeams(group)
      .map((code) => ({ code, team: getTeam(code) }))
      .sort((a, b) => (b.team?.rating ?? 0) - (a.team?.rating ?? 0));

    return {
      first: groupTeams[0]?.code ?? null,
      second: groupTeams[1]?.code ?? null,
    };
  }

  return {
    first: rows[0]?.team ?? null,
    second: rows[1]?.team ?? null,
  };
}

/** Check if all matches in a group have been played/resolved */
export function isGroupComplete(
  group: string,
  sourceMatches: readonly Match[] = defaultMatches,
): boolean {
  const groupMatches = sourceMatches.filter(
    (m) => m.group === group && m.stage === "group",
  );
  if (groupMatches.length === 0) return false;
  return groupMatches.every((m) => m.status !== "scheduled");
}

function compareStandingRows(
  a: GroupStandingRow,
  b: GroupStandingRow,
): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference)
    return b.goalDifference - a.goalDifference;
  return b.goalsFor - a.goalsFor;
}

/** Best third-placed teams across all groups (8 qualify for R32 in WC2026) */
export function getBestThirdPlaceTeams(
  sourceMatches: readonly Match[] = defaultMatches,
  count = 8,
): (TeamCode | null)[] {
  const allStandings = getAllGroupStandings(sourceMatches);

  const thirdPlaces = allStandings
    .map((g) => g.rows[2])
    .filter((row): row is GroupStandingRow => row !== undefined);

  const withResults = thirdPlaces.filter((r) => r.played > 0);

  if (withResults.length > 0) {
    return [...withResults]
      .sort(compareStandingRows)
      .slice(0, count)
      .map((r) => r.team);
  }

  return thirdPlaces
    .map((row) => {
      const team = getTeam(row.team);
      return { team: row.team, rating: team?.rating ?? 0 };
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count)
    .map((e) => e.team);
}
