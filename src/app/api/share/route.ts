import { NextResponse } from "next/server";
import {
  encodeBracketToken,
  decodeBracketToken,
  buildShareUrl,
  buildShareText,
  ShareSecretMissingError,
  type SharePayload,
} from "@/lib/share-token";
import { parseShareLangParam, type Locale } from "@/lib/i18n";
import { sharePostBodySchema } from "@/lib/share-schema";

export const dynamic = "force-dynamic";

/**
 * POST /api/share
 * Body: { predictions: BracketPredictions, ownerName?: string }
 * Returns: { hash, url, shareText }
 */
export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const parsed = sharePostBodySchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const payload: SharePayload = {
      predictions: body.predictions,
      ownerName: body.ownerName,
    };

    const locale: Locale = parseShareLangParam(body.locale ?? null);
    const hash = await encodeBracketToken(payload);
    const url = buildShareUrl(hash, locale);

    return NextResponse.json({
      hash,
      url,
      shareText: `${buildShareText(payload.ownerName, locale)}\n${url}`,
    });
  } catch (error) {
    if (error instanceof ShareSecretMissingError) {
      console.error("[api/share] share secret not configured");
      return NextResponse.json(
        { error: "Share service unavailable" },
        { status: 503 },
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[api/share] failed to create share", message);
    return NextResponse.json(
      { error: "Failed to create share" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/share?hash=<token>
 * Returns the decoded bracket payload for a given share hash.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get("hash");

    if (!hash) {
      return NextResponse.json(
        { error: "Missing hash parameter" },
        { status: 400 },
      );
    }

    const payload = await decodeBracketToken(hash);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired share link" },
        { status: 404 },
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[api/share] failed to decode share", message);
    return NextResponse.json(
      { error: "Failed to decode share" },
      { status: 500 },
    );
  }
}
