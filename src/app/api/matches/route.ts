import { NextResponse } from "next/server"
import { matches as staticMatches } from "@/data/matches"
import { mergeCopaFixturesIntoMatches } from "@/lib/copa-catalog"
import { fetchCopaFixtures, isCopaCatalogConfigured } from "@/lib/supabase/catalog"
import { fetchAllWorldCupData } from "@/lib/worldcup-api"
import { mergeApiGamesIntoMatches } from "@/lib/worldcup-mapper"

export const revalidate = 30

export async function GET() {
  try {
    let matches = [...staticMatches]
    const sources: string[] = []

    if (isCopaCatalogConfigured()) {
      const copaFixtures = await fetchCopaFixtures()
      if (copaFixtures.length > 0) {
        matches = mergeCopaFixturesIntoMatches(staticMatches, copaFixtures)
        sources.push("projetoCopa-supabase")
      }
    }

    // worldcup26.ir is always merged for authoritative live scores and status.
    const { teams, games, stadiums } = await fetchAllWorldCupData()
    matches = mergeApiGamesIntoMatches(matches, games, teams, stadiums)
    sources.push("worldcup26.ir")

    const source = sources.length > 0 ? sources.join("+") : "static"

    return NextResponse.json({
      matches,
      count: matches.length,
      source,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[api/matches] failed to fetch live data", message)
    return NextResponse.json({
      matches: staticMatches,
      count: staticMatches.length,
      source: "static",
      error: message,
    })
  }
}
