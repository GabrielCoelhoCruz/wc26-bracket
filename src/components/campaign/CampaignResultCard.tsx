"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { DraftPitch } from "@/components/draft/DraftPitch";
import { getPositionEmoji } from "@/lib/draft";
import { getCampaignStageLabel } from "@/lib/i18n";
import type { CampaignState } from "@/types/wc26";
import type { FormationId } from "@/lib/formations";
import { Share2, Trophy } from "lucide-react";
import { useState } from "react";

interface CampaignResultCardProps {
  campaign: CampaignState;
  onRestart: () => void;
}

export function CampaignResultCard({ campaign, onRestart }: CampaignResultCardProps) {
  const { locale, t, format } = useLanguage();
  const [copied, setCopied] = useState(false);
  const isChampion = campaign.outcome === "champion";
  const played = campaign.matches.filter((m) => m.result);
  const lastMatch = played[played.length - 1];
  const playStyleLabel = t.draft.playStyles[campaign.playStyle];
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const text = [
    isChampion ? t.draft.shareChampion : t.draft.shareEnded,
    `${t.draft.shareFormation}: ${campaign.formation} · ${playStyleLabel}`,
    `${t.draft.shareXi}: ${campaign.userTeam?.rating} OVR`,
    "",
    ...played.map(
      (m) =>
        `${getCampaignStageLabel(m.matchId, locale)}: ${m.result?.homeScore}–${m.result?.awayScore}${m.result?.wentToPenalties ? ` ${t.draft.sharePen}` : ""}`,
    ),
    "",
    format(t.draft.shareBuild, { url: origin }),
  ].join("\n");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="rounded-3xl border-2 border-accent bg-gradient-to-br from-card/80 to-background p-6 text-center shadow-2xl">
        <Trophy
          size={48}
          className={`mx-auto ${isChampion ? "text-accent" : "text-muted-foreground"}`}
        />
        <h2 className="mt-4 text-2xl font-black text-foreground">
          {isChampion ? t.draft.champion : t.draft.eliminated}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isChampion
            ? format(t.draft.championBody, { count: played.length })
            : format(t.draft.eliminatedBody, {
                stage: lastMatch
                  ? getCampaignStageLabel(lastMatch.matchId, locale)
                  : t.common.round,
              })}
        </p>

        {campaign.userTeam && (
          <div className="mt-6">
            <DraftPitch
              team={campaign.userTeam}
              formation={campaign.formation as FormationId}
            />
          </div>
        )}

        <ul className="mt-6 space-y-2 text-left text-sm">
          {campaign.userTeam?.players.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <span>{getPositionEmoji(p.position)}</span>
              <span className="flex-1 truncate">{p.name}</span>
              <span className="text-xs text-muted-foreground">{p.rating}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-black text-background transition hover:brightness-110"
        >
          <Share2 size={16} /> {copied ? t.common.copied : t.common.copyResult}
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold transition hover:bg-muted/60"
        >
          {t.common.newCampaign}
        </button>
      </div>
    </div>
  );
}
