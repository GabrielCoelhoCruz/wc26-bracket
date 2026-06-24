// ---------------------------------------------------------------------------
// WC26 – Client for https://worldcup26.ir (rezarahiminia/worldcup2026)
// Free open-source REST API — no API key required for public GET endpoints
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.WORLDCUP_API_URL ?? "https://worldcup26.ir"

// ---------------------------------------------------------------------------
// Raw API types
// ---------------------------------------------------------------------------

export interface WcApiTeam {
  _id?: string
  id: string
  name_en: string
  name_fa?: string
  fifa_code: string
  iso2: string
  groups: string
  flag: string
}

export interface WcApiGame {
  _id?: string
  id: string
  home_team_id: string
  away_team_id: string
  home_score: string
  away_score: string
  home_scorers?: string | null
  away_scorers?: string | null
  group: string
  matchday: string
  local_date: string
  persian_date?: string
  stadium_id: string
  finished: string
  time_elapsed: string
  type: string
  home_team_name_en?: string
  away_team_name_en?: string
  home_team_label?: string
  away_team_label?: string
}

export interface WcApiGroupRow {
  team_id: string
  mp: string
  w: string
  l: string
  d: string
  pts: string
  gf: string
  ga: string
  gd: string
  _id?: string
}

export interface WcApiGroup {
  _id?: string
  name: string
  teams: WcApiGroupRow[]
}

export interface WcApiStadium {
  _id?: string
  id: string
  name_en: string
  name_fa?: string
  fifa_name: string
  city_en: string
  city_fa?: string
  country_en: string
  country_fa?: string
  capacity: number
  region: string
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function wcFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 30 },
  })

  if (!res.ok) {
    throw new Error(
      `[worldcup-api] ${res.status} ${res.statusText} for ${path}`,
    )
  }

  return res.json() as Promise<T>
}

export async function fetchApiTeams(): Promise<WcApiTeam[]> {
  const data = await wcFetch<{ teams: WcApiTeam[] }>("/get/teams")
  return data.teams ?? []
}

export async function fetchApiGames(): Promise<WcApiGame[]> {
  const data = await wcFetch<{ games: WcApiGame[] }>("/get/games")
  return data.games ?? []
}

export async function fetchApiGroups(): Promise<WcApiGroup[]> {
  const data = await wcFetch<{ groups: WcApiGroup[] }>("/get/groups")
  return data.groups ?? []
}

export async function fetchApiStadiums(): Promise<WcApiStadium[]> {
  const data = await wcFetch<{ stadiums: WcApiStadium[] }>("/get/stadiums")
  return data.stadiums ?? []
}

export async function fetchAllWorldCupData() {
  const [teams, games, groups, stadiums] = await Promise.all([
    fetchApiTeams(),
    fetchApiGames(),
    fetchApiGroups(),
    fetchApiStadiums(),
  ])
  return { teams, games, groups, stadiums }
}
