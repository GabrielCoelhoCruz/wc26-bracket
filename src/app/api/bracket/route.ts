// ---------------------------------------------------------------------------
// WC26 – Bracket persistence API
// POST /api/bracket – save a bracket and return a shareable hash
// GET  /api/bracket?id=<id> – retrieve a saved bracket
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { TeamCode, BracketPrediction } from "@/types/wc26";

const predictionEntrySchema = z.object({
  winner: z.string().min(1).max(3),
  homeScore: z.number().int().min(0).optional(),
  awayScore: z.number().int().min(0).optional(),
});

const bracketSchema = z.object({
  id: z.string().min(1),
  predictions: z.record(z.string().min(1), predictionEntrySchema),
  r32Teams: z.record(
    z.string().min(1),
    z.object({
      homeTeam: z.string().min(1).max(3).nullable(),
      awayTeam: z.string().min(1).max(3).nullable(),
    }),
  ),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

interface SavedBracketRecord {
  id: string;
  predictions: BracketPrediction;
  r32Teams: Record<string, { homeTeam: TeamCode | null; awayTeam: TeamCode | null }>;
  createdAt: string;
  updatedAt: string;
  hash: string;
}

/** In-memory store. Survives for the lifetime of the server process. */
const bracketStore = new Map<string, SavedBracketRecord>();

function generateHash(length = 7): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bracketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const record: SavedBracketRecord = {
      id: parsed.data.id,
      predictions: parsed.data.predictions,
      r32Teams: parsed.data.r32Teams,
      createdAt: parsed.data.createdAt ?? now,
      updatedAt: now,
      hash: generateHash(),
    };

    bracketStore.set(record.id, record);

    return NextResponse.json({
      id: record.id,
      hash: record.hash,
      url: `/b/${record.hash}`,
      updatedAt: record.updatedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[api/bracket] POST failed", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 },
      );
    }

    const record = bracketStore.get(id);
    if (!record) {
      return NextResponse.json(
        { error: "Bracket not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: record.id,
      predictions: record.predictions,
      r32Teams: record.r32Teams,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      hash: record.hash,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[api/bracket] GET failed", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
