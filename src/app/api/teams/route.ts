import { NextResponse } from "next/server"
import { teams as staticTeams } from "@/data/teams"
import { mergeCopaTeams } from "@/lib/copa-catalog"
import { fetchCopaTeams, isCopaCatalogConfigured } from "@/lib/supabase/catalog"
import { fetchApiTeams } from "@/lib/worldcup-api"
import { mapApiTeamToInternal } from "@/lib/worldcup-mapper"

export const dynamic = "force-dynamic"
export const revalidate = 300

export async function GET() {
  let teams = [...staticTeams]
  let source = "static"

  if (isCopaCatalogConfigured()) {
    try {
      const copaTeams = await fetchCopaTeams()
      if (copaTeams.length > 0) {
        teams = mergeCopaTeams(staticTeams, copaTeams)
        source = "projetoCopa-supabase"
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      console.error("[api/teams] Supabase catalog failed", message)
    }
  }

  if (source === "static") {
    try {
      const apiTeams = await fetchApiTeams()
      teams = apiTeams.map(mapApiTeamToInternal)
      source = "worldcup26.ir"
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      console.error("[api/teams] worldcup26.ir failed", message)
    }
  }

  return NextResponse.json({
    teams,
    count: teams.length,
    source,
    updatedAt: new Date().toISOString(),
  })
}
