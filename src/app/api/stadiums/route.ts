import { NextResponse } from "next/server"
import { stadiums as staticStadiums } from "@/data/stadiums"
import { mergeCopaVenues } from "@/lib/copa-catalog"
import {
  fetchCopaVenues,
  isCopaCatalogConfigured,
} from "@/lib/supabase/catalog"
import { fetchApiStadiums } from "@/lib/worldcup-api"
import { mapApiStadium } from "@/lib/worldcup-mapper"

export const dynamic = "force-dynamic"
export const revalidate = 3600

export async function GET() {
  let stadiums = [...staticStadiums]
  let source = "static"

  if (isCopaCatalogConfigured()) {
    try {
      const copaVenues = await fetchCopaVenues()
      if (copaVenues.length > 0) {
        stadiums = mergeCopaVenues(staticStadiums, copaVenues)
        source = "projetoCopa-supabase"
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      console.error("[api/stadiums] Supabase catalog failed", message)
    }
  }

  if (source === "static") {
    try {
      const apiStadiums = await fetchApiStadiums()
      stadiums = apiStadiums.map(mapApiStadium)
      source = "worldcup26.ir"
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      console.error("[api/stadiums] worldcup26.ir failed", message)
    }
  }

  return NextResponse.json({
    stadiums,
    count: stadiums.length,
    source,
    updatedAt: new Date().toISOString(),
  })
}
