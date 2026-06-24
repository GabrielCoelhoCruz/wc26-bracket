import { NextResponse } from "next/server";
import { fetchCopaTeams, isCopaCatalogConfigured } from "@/lib/supabase/catalog";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  if (!isCopaCatalogConfigured()) {
    return NextResponse.json(
      { teams: [], source: "unconfigured", count: 0 },
      { status: 200 },
    );
  }

  try {
    const teams = await fetchCopaTeams();
    return NextResponse.json({
      teams,
      count: teams.length,
      source: "projetoCopa-supabase",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ teams: [], error: message, source: "error" }, { status: 500 });
  }
}
