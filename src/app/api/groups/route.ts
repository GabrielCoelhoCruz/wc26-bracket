import { NextResponse } from "next/server"
import { fetchApiGroups, fetchApiTeams } from "@/lib/worldcup-api"
import { mapApiGroupsToStandings } from "@/lib/worldcup-mapper"
import { getAllGroupStandings } from "@/lib/group-standings"

export const revalidate = 30

export async function GET() {
  try {
    const [apiGroups, apiTeams] = await Promise.all([
      fetchApiGroups(),
      fetchApiTeams(),
    ])
    const groups = mapApiGroupsToStandings(apiGroups, apiTeams)
    return NextResponse.json({
      groups,
      count: groups.length,
      source: "worldcup26.ir",
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[api/groups] failed", message)
    return NextResponse.json({
      groups: getAllGroupStandings(),
      count: getAllGroupStandings().length,
      source: "static",
      error: message,
    })
  }
}
