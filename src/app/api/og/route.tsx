import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { decodeBracketToken } from "@/lib/share-token";
import { getTeam } from "@/data/teams";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get("hash");

  let ownerName: string | undefined;
  let predictionCount = 0;
  let champion: string | undefined;

  if (hash) {
    const payload = await decodeBracketToken(hash);
    if (payload) {
      ownerName = payload.ownerName;
      predictionCount = Object.keys(payload.predictions).length;
      const finalPred = payload.predictions["final"];
      if (finalPred) {
        const team = getTeam(finalPred.winner);
        champion = team?.namePt ?? finalPred.winner;
      }
    }
  }

  const title = ownerName
    ? `${ownerName} montou o bracket da Copa 2026`
    : "WC26 Bracket + Draft";
  const subtitle = champion
    ? `Palpite de campeã: ${champion}`
    : `${predictionCount} palpites no mata-mata`;

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
          {title}
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 34,
            color: "#fbbf24",
            fontWeight: 700,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            marginTop: 60,
            fontSize: 24,
            color: "#a1a1aa",
            fontWeight: 600,
          }}
        >
          wc26.app · Monte o seu bracket e desafie seus amigos
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
