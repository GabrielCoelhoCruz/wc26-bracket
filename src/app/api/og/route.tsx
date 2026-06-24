import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { decodeBracketToken } from "@/lib/share-token";
import { getTeam } from "@/data/teams";
import {
  getShareOgContent,
  getTeamName,
  parseShareLangParam,
} from "@/lib/i18n";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get("hash");
  const locale = parseShareLangParam(request.nextUrl.searchParams.get("lang"));

  let ownerName: string | undefined;
  let predictionCount = 0;
  let championName: string | undefined;
  let valid = false;

  if (hash) {
    const payload = await decodeBracketToken(hash);
    if (payload) {
      valid = true;
      ownerName = payload.ownerName;
      predictionCount = Object.keys(payload.predictions).length;
      const finalPred = payload.predictions["final"];
      if (finalPred) {
        const team = getTeam(finalPred.winner);
        championName = team
          ? getTeamName(team, locale)
          : finalPred.winner;
      }
    }
  }

  const og = getShareOgContent(
    {
      ownerName,
      predictionCount,
      championName,
      valid,
    },
    locale,
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)",
          color: "#f5f5f5",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 40,
          }}
        >
          <span style={{ fontSize: 80 }}>⚽</span>
          <span style={{ fontSize: 80 }}>🏆</span>
        </div>
        <div
          style={{
            fontSize: 58,
            fontWeight: 900,
            textAlign: "center",
            lineHeight: 1.1,
            maxWidth: 1000,
          }}
        >
          {og.title}
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 34,
            color: "#fbbf24",
            fontWeight: 700,
          }}
        >
          {og.imageSubtitle}
        </div>
        <div
          style={{
            marginTop: 60,
            fontSize: 24,
            color: "#a1a1aa",
            fontWeight: 600,
          }}
        >
          {og.footer}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
