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
    let source = "static"

    if (isCopaCatalogConfigured()) {
      const copaFixtures = await fetchCopaFixtures()
      if (copaFixtures.length > 0) {
        matches = mergeCopaFixturesIntoMatches(staticMatches, copaFixtures)
        source = "projetoCopa-supabase"
      }
    }

    if (source === "static") {
      const { teams, games, stadiums } = await fetchAllWorldCupData()
      matches = mergeApiGamesIntoMatches(staticMatches, games, teams, stadiums)
      source = "worldcup26.ir"
    }

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
