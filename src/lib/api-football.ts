/**
 * API client for https://v3.football.api-sports.io
 *
 * Requires the API_FOOTBALL_KEY environment variable to be set.
 * Uses ESModule imports/exports.
 */

import type {
  Wc26Team,
  Wc26Match,
  Wc26GroupStanding,
  MatchStatus,
} from "@/types/wc26";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BASE_URL = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_FOOTBALL_KEY ?? "";

if (!API_KEY) {
  console.warn(
    "[api-football] API_FOOTBALL_KEY is not set. API calls will fail with 401.",
  );
}

// ---------------------------------------------------------------------------
// Raw API response types (mapped to our Wc26 types)
// ---------------------------------------------------------------------------

interface ApiTeam {
  id: number;
  name: string;
  code: string | null;
  logo: string | null;
}

interface ApiScore {
  home: number | null;
  away: number | null;
}

interface ApiFixture {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  status: {
    long: string;
    short: MatchStatus;
    elapsed: number | null;
  };
  venue: {
    name: string | null;
    city: string | null;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface ApiLeagueStanding {
  group: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface ApiResponse<T> {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<ApiResponse<T>> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": "v3.football.api-sports.io",
    },
  });

  if (!res.ok) {
    throw new Error(
      `[api-football] ${res.status} ${res.statusText} for ${endpoint}`,
    );
  }

  const data: ApiResponse<T> = await res.json();

  if (data.errors?.length) {
    throw new Error(
      `[api-football] API error: ${data.errors.join(", ")}`,
    );
  }

  return data;
}

function mapTeam(api: ApiTeam): Wc26Team {
  return {
    id: api.id,
    name: api.name,
    code: api.code,
    flagUrl: api.logo,
    group: null, // filled in by calling context if available
  };
}

function mapMatch(fixture: ApiFixture): Wc26Match {
  const homeTeam: ApiTeam = fixture.teams?.home ?? {};
  const awayTeam: ApiTeam = fixture.teams?.away ?? {};
  const score = fixture.score ?? {};
  const fullTime = score.fulltime ?? {};
  const halfTime = score.halftime ?? {};
  const extraTime = score.extratime ?? {};
  const penalty = score.penalty ?? {};

  const dateObj = new Date(fixture.date);
  const dateStr = dateObj.toISOString().slice(0, 10);
  const timeStr = dateObj.toTimeString().slice(0, 5);

  return {
    id: fixture.id,
    round: fixture.league?.round ?? null,
    status: fixture.status?.short ?? "NS",
    elapsed: fixture.status?.elapsed ?? null,
    timestamp: fixture.timestamp ?? Math.floor(dateObj.getTime() / 1000),
    timezone: fixture.timezone ?? "UTC",
    date: dateStr,
    time: timeStr,
    group: fixture.league?.group ?? null,
    homeTeam: mapTeam(homeTeam),
    awayTeam: mapTeam(awayTeam),
    score: {
      fullTime: { home: fullTime.home ?? null, away: fullTime.away ?? null },
      halfTime: { home: halfTime.home ?? null, away: halfTime.away ?? null },
      extraTime: {
        home: extraTime.home ?? null,
        away: extraTime.away ?? null,
      },
      penalty: { home: penalty.home ?? null, away: penalty.away ?? null },
    },
    venue: fixture.venue?.name ?? null,
    referee: fixture.referee ?? null,
  };
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Fetch all teams participating in the 2026 FIFA World Cup.
 * Uses the /teams endpoint filtered by the WC26 league (league=1475 for World Cup).
 */
export async function fetchWc26Teams(): Promise<Wc26Team[]> {
  // The 2026 World Cup league ID in api-sports is typically 1475.
  // We fetch teams that are in the "squad" for the WC26 season.
  const data = await apiFetch<ApiTeam>("/teams", {
    league: "1475",
    season: "2026",
  });

  return data.response.map(mapTeam);
}

/**
 * Fetch all matches for the 2026 FIFA World Cup.
 */
export async function fetchWc26Matches(): Promise<Wc26Match[]> {
  const data = await apiFetch<ApiFixture>("/fixtures", {
    league: "1475",
    season: "2026",
  });

  return data.response.map(mapMatch);
}

/**
 * Fetch a single 2026 World Cup match by its fixture ID.
 */
export async function fetchWc26MatchById(
  id: number,
): Promise<Wc26Match | null> {
  const data = await apiFetch<ApiFixture>("/fixtures", {
    id: String(id),
  });

  if (data.results === 0) return null;
  return mapMatch(data.response[0]);
}

/**
 * Fetch group standings for the 2026 World Cup.
 * Returns an array of group standings (one per group).
 */
export async function fetchWc26Standings(): Promise<Wc26GroupStanding[]> {
  const data = await apiFetch<ApiLeagueStanding>("/standings", {
    league: "1475",
    season: "2026",
  });

  const groups: Wc26GroupStanding[] = [];

  for (const entry of data.response) {
    const standings = entry.league?.standings ?? [];
    for (const groupStanding of standings) {
      const rows = groupStanding.map(
        (row: {
          rank: number;
          team: ApiTeam;
          points: number;
          all: {
            played: number;
            win: number;
            draw: number;
            lose: number;
            goals: { for: number; against: number };
          };
          goalsDiff: number;
        }) => ({
          rank: row.rank,
          team: mapTeam(row.team),
          points: row.points,
          played: row.all?.played ?? 0,
          won: row.all?.win ?? 0,
          drawn: row.all?.draw ?? 0,
          lost: row.all?.lose ?? 0,
          goalsFor: row.all?.goals?.for ?? 0,
          goalsAgainst: row.all?.goals?.against ?? 0,
          goalDifference: row.goalsDiff ?? 0,
        }),
      );

      if (rows.length > 0) {
        groups.push({
          group: entry.league?.group ?? "",
          rows,
        });
      }
    }
  }

  return groups;
}
