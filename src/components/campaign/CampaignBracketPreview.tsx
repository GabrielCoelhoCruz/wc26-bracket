"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { getTeam } from "@/data/teams";
import { getCampaignStageLabel, getTeamName } from "@/lib/i18n";
import type { CampaignMatch, CampaignState } from "@/types/wc26";
import { Trophy } from "lucide-react";

interface CampaignBracketPreviewProps {
  campaign: CampaignState;
  onStart: () => void;
}

function OpponentLabel({ match }: { match: CampaignMatch }) {
  const { locale, t } = useLanguage();
  const code = match.homeNation ?? match.awayNation;
  if (!code) return <span>{t.common.opponent}</span>;
  const team = getTeam(code);
  return (
    <span>
      {team?.flag} {team ? getTeamName(team, locale) : code}
    </span>
  );
}

export function CampaignBracketPreview({ campaign, onStart }: CampaignBracketPreviewProps) {
  const { locale, t, format } = useLanguage();
  const playStyleLabel = t.draft.playStyles[campaign.playStyle];

  if (campaign.matches.length === 0) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-6 text-center">
        <h2 className="text-2xl font-black text-foreground">{t.common.xiReady}</h2>
        <p className="text-sm text-muted-foreground">{t.draft.xiReadyBody}</p>
        {campaign.userTeam && (
          <p className="text-lg font-bold text-accent">
            {t.common.xiRating}: {campaign.userTeam.rating} OVR
          </p>
        )}
        <a
          href="/bracket"
          className="inline-flex rounded-lg bg-pitch px-6 py-3 text-sm font-black text-white transition hover:brightness-110"
        >
          {t.common.goToBracket}
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-foreground">{t.common.yourKnockoutRoute}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {format(t.draft.routeSubtitle, { count: campaign.matches.length })}
        </p>
      </div>

      <ol className="space-y-3">
        {campaign.matches.map((m, i) => (
          <li
            key={m.matchId}
            className="flex items-center gap-4 rounded-xl border border-border bg-card/60 p-4"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
              {i + 1}
            </span>
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {getCampaignStageLabel(m.matchId, locale)}
              </div>
              <div className="mt-1 text-sm font-medium text-foreground">
                {t.draft.yourXiVs} <OpponentLabel match={m} />
              </div>
            </div>
            {i === 0 && (
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">
                {t.common.entry}
              </span>
            )}
          </li>
        ))}
      </ol>

      {campaign.userTeam && (
        <div className="rounded-xl border border-border bg-card/40 p-4 text-center">
          <p className="text-xs text-muted-foreground">{t.common.xiRating}</p>
          <p className="text-3xl font-black text-accent">{campaign.userTeam.rating}</p>
          <p className="text-xs text-muted-foreground">
            {campaign.formation} · {playStyleLabel}
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-2 rounded-lg bg-pitch px-8 py-3 text-sm font-black text-white transition hover:brightness-110"
        >
          <Trophy size={16} /> {t.common.startCampaign}
        </button>
      </div>
    </div>
  );
}
