// ---------------------------------------------------------------------------
// WC26 – Map worldcup26.ir API responses to internal project types
// ---------------------------------------------------------------------------

import { getTeamMeta } from "@/lib/worldcup-meta"
import { parseScorers } from "@/lib/parse-scorers"
import type {
  WcApiGame,
  WcApiGroup,
  WcApiStadium,
  WcApiTeam,
} from "@/lib/worldcup-api"
import type { Match, Team, TeamCode } from "@/types/wc26"
import type { GroupStanding, GroupStandingRow } from "@/lib/group-standings"

export interface Stadium {
  id: string
  name: string
  fifaName: string
  city: string
  country: string
  capacity: number
  region: string
}

function parseLocalDate(localDate: string): { date: string; time: string } {
  // Format: "06/11/2026 13:00"
  const [datePart, timePart] = localDate.split(" ")
  const [mm, dd, yyyy] = (datePart ?? "").split("/")
  return {
    date: `${yyyy}-${mm?.padStart(2, "0")}-${dd?.padStart(2, "0")}`,
    time: timePart ?? "00:00",
  }
}

function isFinished(game: WcApiGame): boolean {
  return game.finished?.toUpperCase() === "TRUE"
}

function resolveGameStatus(game: WcApiGame): {
  status: Match["status"]
  elapsed?: string
} {
  if (isFinished(game)) {
    return { status: "finished", elapsed: "FT" }
  }

  const elapsed = game.time_elapsed?.trim() ?? ""
  const lower = elapsed.toLowerCase()

  if (lower === "live" || /^\d+/.test(elapsed) || lower === "ht") {
    return { status: "live", elapsed: elapsed || "live" }
  }

  return { status: "scheduled" }
}

function mapGameType(type: string): Match["stage"] {
  switch (type.toLowerCase()) {
    case "group":
      return "group"
    case "r32":
      return "round_of_32"
    case "r16":
      return "round_of_16"
    case "qf":
      return "quarter_final"
    case "sf":
      return "semi_final"
    case "third":
      return "third_place"
    case "final":
      return "final"
    default:
      return "group"
  }
}

export function mapApiTeamToInternal(api: WcApiTeam): Team {
  const code = api.fifa_code.toUpperCase() as TeamCode
  const meta = getTeamMeta(code)
  return {
    code,
    name: api.name_en,
    namePt: meta.namePt,
    nameFa: api.name_fa,
    flag: meta.flag,
    flagUrl: api.flag || undefined,
    iso2: api.iso2,
    apiId: api.id,
    group: api.groups,
    rating: meta.rating,
  }
}

export function buildTeamIdMap(teams: WcApiTeam[]): Map<string, WcApiTeam> {
  return new Map(teams.map((t) => [t.id, t]))
}

export function mapApiGameToMatch(
  game: WcApiGame,
  teamById: Map<string, WcApiTeam>,
  stadiumById: Map<string, WcApiStadium>,
): Match | null {
  const stage = mapGameType(game.type)
  const homeApi = teamById.get(game.home_team_id)
  const awayApi = teamById.get(game.away_team_id)
  const stadium = stadiumById.get(game.stadium_id)

  let homeCode: TeamCode | null = homeApi?.fifa_code.toUpperCase() as TeamCode | null
  let awayCode: TeamCode | null = awayApi?.fifa_code.toUpperCase() as TeamCode | null

  if (!homeCode && game.home_team_id === "0") homeCode = null
  if (!awayCode && game.away_team_id === "0") awayCode = null

  if (!homeCode || !awayCode) {
    if (stage === "group") return null
    homeCode = (homeCode ?? "TBD") as TeamCode
    awayCode = (awayCode ?? "TBD") as TeamCode
  }

  const { date, time } = parseLocalDate(game.local_date)
  const { status, elapsed } = resolveGameStatus(game)
  const homeScore = parseInt(game.home_score, 10)
  const awayScore = parseInt(game.away_score, 10)
  const hasScores = !Number.isNaN(homeScore) && !Number.isNaN(awayScore)

  return {
    id: `wc26-${game.id}`,
    apiId: game.id,
    stage,
    group: stage === "group" ? game.group : undefined,
    homeTeam: homeCode,
    awayTeam: awayCode,
    date,
    time,
    persianDate: game.persian_date,
    stadium: stadium?.name_en,
    stadiumId: game.stadium_id,
    city: stadium?.city_en,
    homeScore:
      hasScores && (status === "finished" || status === "live")
        ? homeScore
        : undefined,
    awayScore:
      hasScores && (status === "finished" || status === "live")
        ? awayScore
        : undefined,
    homeScorers: parseScorers(game.home_scorers),
    awayScorers: parseScorers(game.away_scorers),
    homeTeamLabel: game.home_team_label,
    awayTeamLabel: game.away_team_label,
    status,
    elapsed: status === "live" ? elapsed : status === "finished" ? "FT" : undefined,
  }
}

export function mapApiGamesToMatches(
  games: WcApiGame[],
  teams: WcApiTeam[],
  stadiums: WcApiStadium[],
): Match[] {
  const teamById = buildTeamIdMap(teams)
  const stadiumById = new Map(stadiums.map((s) => [s.id, s]))

  return games
    .map((g) => mapApiGameToMatch(g, teamById, stadiumById))
    .filter((m): m is Match => m !== null)
}

export function mapApiStadium(stadium: WcApiStadium): Stadium {
  return {
    id: stadium.id,
    name: stadium.name_en,
    fifaName: stadium.fifa_name,
    city: stadium.city_en,
    country: stadium.country_en,
    capacity: stadium.capacity,
    region: stadium.region,
  }
}

export function mapApiGroupsToStandings(
  groups: WcApiGroup[],
  teams: WcApiTeam[],
): GroupStanding[] {
  const teamById = new Map(teams.map((t) => [t.id, t]))

  return groups
    .map((group) => {
      const rows = group.teams
        .map((row): GroupStandingRow | null => {
          const apiTeam = teamById.get(row.team_id)
          if (!apiTeam) return null
          const code = apiTeam.fifa_code.toUpperCase() as TeamCode
          const meta = getTeamMeta(code)
          return {
            team: code,
            teamName: meta.namePt,
            flag: meta.flag,
            flagUrl: apiTeam.flag,
            played: parseInt(row.mp, 10) || 0,
            won: parseInt(row.w, 10) || 0,
            drawn: parseInt(row.d, 10) || 0,
            lost: parseInt(row.l, 10) || 0,
            goalsFor: parseInt(row.gf, 10) || 0,
            goalsAgainst: parseInt(row.ga, 10) || 0,
            goalDifference: parseInt(row.gd, 10) || 0,
            points: parseInt(row.pts, 10) || 0,
          }
        })
        .filter((r): r is GroupStandingRow => r !== null)
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points
          if (b.goalDifference !== a.goalDifference)
            return b.goalDifference - a.goalDifference
          return b.goalsFor - a.goalsFor
        })

      return { group: group.name, rows }
    })
    .sort((a, b) => a.group.localeCompare(b.group))
}

/** Merge live API data into a base match list (by apiId, then home-away codes) */
export function mergeApiGamesIntoMatches(
  base: readonly Match[],
  games: WcApiGame[],
  teams: WcApiTeam[],
  stadiums: WcApiStadium[],
): Match[] {
  const apiMatches = mapApiGamesToMatches(games, teams, stadiums)
  const apiById = new Map(apiMatches.map((m) => [m.id, m]))
  const apiByTeams = new Map<string, Match>()

  for (const m of apiMatches) {
    if (m.homeTeam !== "TBD" && m.awayTeam !== "TBD") {
      apiByTeams.set(`${m.homeTeam}-${m.awayTeam}`, m)
    }
  }

  return base.map((m) => {
    const api = apiById.get(m.id) ?? apiByTeams.get(`${m.homeTeam}-${m.awayTeam}`)
    if (!api || api.status === "scheduled") {
      if (!api) return { ...m }
      return {
        ...m,
        time: api.time ?? m.time,
        persianDate: api.persianDate ?? m.persianDate,
        stadiumId: api.stadiumId ?? m.stadiumId,
        homeTeamLabel: api.homeTeamLabel ?? m.homeTeamLabel,
        awayTeamLabel: api.awayTeamLabel ?? m.awayTeamLabel,
        homeScorers: api.homeScorers ?? m.homeScorers,
        awayScorers: api.awayScorers ?? m.awayScorers,
      }
    }
    return {
      ...m,
      homeScore: api.homeScore,
      awayScore: api.awayScore,
      status: api.status,
      elapsed: api.elapsed,
      time: api.time ?? m.time,
      persianDate: api.persianDate ?? m.persianDate,
      stadiumId: api.stadiumId ?? m.stadiumId,
      homeTeamLabel: api.homeTeamLabel ?? m.homeTeamLabel,
      awayTeamLabel: api.awayTeamLabel ?? m.awayTeamLabel,
      homeScorers: api.homeScorers ?? m.homeScorers,
      awayScorers: api.awayScorers ?? m.awayScorers,
    }
  })
}
