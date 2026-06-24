"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, Check, AlertCircle, Trophy } from "lucide-react";
import { buildShareUrl, buildShareText } from "@/lib/share-token";
import type { BracketPrediction } from "@/types/wc26";
import { getTeam } from "@/data/teams";

interface SharedBracketViewProps {
  hash: string;
  predictions: BracketPrediction;
  ownerName?: string;
}

export default function SharedBracketView({
  hash,
  predictions,
  ownerName,
}: SharedBracketViewProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shareUrl = buildShareUrl(hash);
  const shareText = `${buildShareText(ownerName)}\n${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // ignore
    }
  };

  const predictionList = Object.entries(predictions).slice(0, 8);

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-12 sm:py-20">
      <div className="max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-[var(--card-bg)] p-3">
          <Trophy size={32} className="text-[var(--accent)]" />
        </div>
        <h1 className="text-3xl font-black text-white sm:text-4xl">
          {ownerName ? `${ownerName} montou o bracket` : "Bracket compartilhado"}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Copa do Mundo 2026 · {Object.keys(predictions).length} palpites
        </p>
      </div>

      {/* Preview card */}
      <div className="mt-10 w-full max-w-md rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Prévia
          </span>
          <span className="text-xs text-[var(--muted)]">
            {mounted ? new URL(shareUrl).hostname : "wc26.app"}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm text-[var(--foreground)]">
            {buildShareText(ownerName)}
          </p>
          {predictionList.length > 0 && (
            <ul className="space-y-1 rounded-xl bg-[var(--surface)] p-3 text-sm">
              {predictionList.map(([matchId, pred]) => {
                const home = getTeam(pred.winner)?.namePt ?? pred.winner;
                return (
                  <li key={matchId} className="flex items-center gap-2">
                    <span className="text-[var(--accent)]">⚽</span>
                    <span className="text-[var(--muted)]">{matchId}:</span>
                    <span className="font-medium text-white">{home}</span>
                    {pred.homeScore !== undefined && pred.awayScore !== undefined && (
                      <span className="text-[var(--muted)]">
                        {pred.homeScore} × {pred.awayScore}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <button
          onClick={handleCopyLink}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {copiedLink ? <Check size={18} /> : <Copy size={18} />}
          {copiedLink ? "Link copiado!" : "Copiar link"}
        </button>
        <button
          onClick={handleCopyText}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--card-bg)]"
        >
          {copiedText ? <Check size={18} /> : <Share2 size={18} />}
          {copiedText ? "Texto copiado!" : "Copiar link + texto"}
        </button>
      </div>

      {Object.keys(predictions).length === 0 && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
          <AlertCircle size={16} />
          Esse bracket ainda não tem palpites.
        </div>
      )}
    </div>
  );
}
