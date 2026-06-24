import { NextResponse } from "next/server";
import { mapCopaFixtureToMatch } from "@/lib/copa-catalog";
import { fetchCopaFixtures, isCopaCatalogConfigured } from "@/lib/supabase/catalog";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function GET() {
  if (!isCopaCatalogConfigured()) {
    return NextResponse.json(
      { fixtures: [], matches: [], source: "unconfigured", count: 0 },
      { status: 200 },
    );
  }

  try {
    const fixtures = await fetchCopaFixtures();
    const matches = fixtures.map((f, i) => mapCopaFixtureToMatch(f, i));
    return NextResponse.json({
      fixtures,
      matches,
      count: matches.length,
      source: "projetoCopa-supabase",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ fixtures: [], matches: [], error: message, source: "error" }, {
      status: 500,
    });
  }
}
