import { NextResponse } from "next/server";
import { fetchWc26Matches } from "@/lib/api-football";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const matches = await fetchWc26Matches();
    return NextResponse.json({ matches, count: matches.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[api/matches] failed to fetch matches", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
