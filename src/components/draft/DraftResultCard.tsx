"use client";

import type { SimulatedMatch } from "@/lib/draft-sim";
import { getTeam } from "@/data/teams";
import { getPositionEmoji } from "@/lib/draft";
import { Share2, Trophy } from "lucide-react";
import { useRef, useState } from "react";

interface DraftResultCardProps {
  match: SimulatedMatch;
}

export function DraftResultCard({ match }: DraftResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const homeFlag = match.home.players[0]?.team ? getTeam(match.home.players[0].team)?.flag : "⚙️";
  const awayFlag = match.away.players[0]?.team ? getTeam(match.away.players[0].team)?.flag : "⚙️";

  const text = `Meu XI WC26: ${match.home.rating} × ${match.away.rating} — Placar simulado ${match.homeScore}–${match.awayScore}`;

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={cardRef}
        className="w-full max-w-md overflow-hidden rounded-3xl border-2 border-[var(--accent)] bg-gradient-to-br from-[var(--card-bg)] to-[var(--background)] p-6 text-[var(--foreground)] shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
            WC26 Draft
          </div>
          <Trophy size={18} className="text-[var(--accent)]" />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-center">
            <div className="text-4xl">{homeFlag}</div>
            <div className="mt-1 text-sm font-bold text-white">Seu XI</div>
            <div className="text-xs opacity-70">Rating {match.home.rating}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-5xl font-black text-white">
              {match.homeScore} – {match.awayScore}
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider opacity-70">
              Placar simulado
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl">{awayFlag}</div>
            <div className="mt-1 text-sm font-bold text-white">Adversário</div>
            <div className="text-xs opacity-70">Rating {match.away.rating}</div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {match.home.players.slice(0, 5).map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-sm">
              <span>{getPositionEmoji(p.position)}</span>
              <span className="flex-1 truncate font-medium">{p.name}</span>
              <span className="text-xs opacity-60">{p.rating}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-xs opacity-60">
          Monte seu time em wc26-bracket.vercel.app/draft
        </div>
      </div>

      <button
        onClick={copyText}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-black text-[var(--background)] transition hover:brightness-110"
      >
        <Share2 size={16} /> {copied ? "Copiado!" : "Copiar texto do card"}
      </button>
    </div>
  );
}
