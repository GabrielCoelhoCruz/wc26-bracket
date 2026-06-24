// ---------------------------------------------------------------------------
// WC26 – Group Standings Engine
// Calculates group tables from match results and determines qualifiers
// ---------------------------------------------------------------------------

import { matches } from "@/data/matches";
import { teams, getTeam } from "@/data/teams";
import type { TeamCode } from "@/types/wc26";

export interface GroupStandingRow {
  team: TeamCode;
  teamName: string;
  flag: string;
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
  for (const t of teams) {
    if (t.group) groupSet.add(t.group);
  }
  return Array.from(groupSet).sort();
}

/** Get all teams in a given group */
export function getGroupTeams(group: string): TeamCode[] {
  return teams
    .filter((t) => t.group === group)
    .map((t) => t.code as TeamCode);
}

/** Build standings for a single group */
export function getGroupStandings(group: string): GroupStandingRow[] {
  const groupTeams = getGroupTeams(group);
  const groupMatches = matches.filter(
    (m) => m.group === group && m.stage === "group",
  );

  // Initialize standings
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

  // Process match results
  for (const match of groupMatches) {
    const home = match.homeTeam as TeamCode;
    const away = match.awayTeam as TeamCode;

    const homeRow = standings.get(home);
    const awayRow = standings.get(away);
    if (!homeRow || !awayRow) continue;

    const homeScore = match.homeScore ?? 0;
    const awayScore = match.awayScore ?? 0;

    // Only count if the match has been played
    if (match.status === "scheduled") continue;

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

  // Build sorted rows
  const rows: GroupStandingRow[] = Array.from(standings.entries())
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
      // Sort by: points > goal difference > goals for
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

  return rows;
}

/** Get all group standings */
export function getAllGroupStandings(): GroupStanding[] {
  return getGroupLetters().map((group) => ({
    group,
    rows: getGroupStandings(group),
  }));
}

/** Get the teams that qualify from a group (top 2) */
export function getGroupQualifiers(group: string): {
  first: TeamCode | null;
  second: TeamCode | null;
} {
  const rows = getGroupStandings(group);
  const hasResults = rows.some((r) => r.played > 0);

  if (!hasResults) {
    // No results yet — rank by rating as default seeding
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
export function isGroupComplete(group: string): boolean {
  const groupMatches = matches.filter(
    (m) => m.group === group && m.stage === "group",
  );
  if (groupMatches.length === 0) return false;
  return groupMatches.every((m) => m.status !== "scheduled");
}
