import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { createClient } from "@supabase/supabase-js"

function loadEnv() {
  try {
    const raw = readFileSync(resolve(".env.local"), "utf8")
    for (const line of raw.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const idx = trimmed.indexOf("=")
      if (idx === -1) continue
      const key = trimmed.slice(0, idx)
      const value = trimmed.slice(idx + 1)
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // no .env.local
  }
}

loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const season = Number(process.env.WORLD_CUP_SEASON ?? 2026)

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
  process.exit(1)
}

const supabase = createClient(url, key)

const [teamsRes, fixturesRes, venuesRes] = await Promise.all([
  supabase
    .from("football_teams")
    .select("id, name, country_code, flag_url, group_name", { count: "exact" })
    .eq("season", season),
  supabase
    .from("football_fixtures")
    .select("id, home_team_name, away_team_name, venue_name, kickoff_at", { count: "exact" })
    .eq("league_id", 1)
    .eq("season", season)
    .limit(3),
  supabase.from("football_venues").select("id, name, city", { count: "exact" }).limit(3),
])

if (teamsRes.error) throw teamsRes.error
if (fixturesRes.error) throw fixturesRes.error
if (venuesRes.error) throw venuesRes.error

console.log(JSON.stringify({
  season,
  teams: { count: teamsRes.count ?? teamsRes.data?.length ?? 0, sample: teamsRes.data?.[0] },
  fixtures: { count: fixturesRes.count ?? 0, sample: fixturesRes.data?.[0] },
  venues: { count: venuesRes.count ?? venuesRes.data?.length ?? 0, sample: venuesRes.data?.[0] },
}, null, 2))
