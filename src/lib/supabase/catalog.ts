// ---------------------------------------------------------------------------
// Supabase read-only client — shared catalog with projetoCopa / copa-family
// ---------------------------------------------------------------------------

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const WORLD_CUP_LEAGUE_ID = 1;
const WORLD_CUP_SEASON = Number(process.env.WORLD_CUP_SEASON ?? 2026);

export type CopaFootballTeam = {
  id: string;
  season: number;
  name: string;
  short_name: string | null;
  slug: string;
  country_code: string | null;
  flag_url: string | null;
  badge_url: string | null;
  group_name: string | null;
  is_qualified: boolean;
};

export type CopaFootballVenue = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  timezone: string | null;
  slug: string;
};

export type CopaFootballFixture = {
  id: string;
  provider: string;
  provider_fixture_id: number;
  league_id: number;
  season: number;
  round: string | null;
  stage: string | null;
  group_name: string | null;
  kickoff_at: string | null;
  status_short: string | null;
  status_long: string | null;
  elapsed: number | null;
  venue_name: string | null;
  venue_city: string | null;
  home_team_id: number | null;
  home_team_name: string;
  home_team_logo: string | null;
  away_team_id: number | null;
  away_team_name: string;
  away_team_logo: string | null;
  home_goals: number | null;
  away_goals: number | null;
};

let cachedClient: SupabaseClient | null = null;

export function isCopaCatalogConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function getCatalogClient(): SupabaseClient | null {
  if (!isCopaCatalogConfigured()) return null;
  if (!cachedClient) {
    cachedClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
  }
  return cachedClient;
}

export async function fetchCopaTeams(): Promise<CopaFootballTeam[]> {
  const supabase = getCatalogClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("football_teams")
    .select(
      "id, season, name, short_name, slug, country_code, flag_url, badge_url, group_name, is_qualified",
    )
    .eq("season", WORLD_CUP_SEASON)
    .order("group_name", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CopaFootballTeam[];
}

export async function fetchCopaFixtures(): Promise<CopaFootballFixture[]> {
  const supabase = getCatalogClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("football_fixtures")
    .select(
      "id, provider, provider_fixture_id, league_id, season, round, stage, group_name, kickoff_at, status_short, status_long, elapsed, venue_name, venue_city, home_team_id, home_team_name, home_team_logo, away_team_id, away_team_name, away_team_logo, home_goals, away_goals",
    )
    .eq("league_id", WORLD_CUP_LEAGUE_ID)
    .eq("season", WORLD_CUP_SEASON)
    .order("kickoff_at", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return (data ?? []) as CopaFootballFixture[];
}

export async function fetchCopaVenues(): Promise<CopaFootballVenue[]> {
  const supabase = getCatalogClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("football_venues")
    .select("id, name, city, country, timezone, slug")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CopaFootballVenue[];
}
