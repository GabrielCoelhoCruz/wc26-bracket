"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { getTeam } from "@/data/teams";
import { getMatchNarrativeForCampaign } from "@/lib/campaign-sim";
import { getCampaignStageLabel, getTeamName } from "@/lib/i18n";
import ScoreboardHeader from "@/components/ui/ScoreboardHeader";
import StadiumButton from "@/components/ui/StadiumButton";
import PitchCard from "@/components/ui/PitchCard";
import type { CampaignMatch, CampaignState } from "@/types/wc26";
import { FastForward, Play } from "lucide-react";

interface CampaignMatchViewProps {
  campaign: CampaignState;
  onSimulateOne: () => void;
  onSimulateAll: () => void;
}

function OpponentBadge({ match }: { match: CampaignMatch }) {
  const { locale, t } = useLanguage();
  const code = match.homeNation ?? match.awayNation;
  const team = code ? getTeam(code) : null;
  return (
    <span className="text-lg">
      {team?.flag} {team ? getTeamName(team, locale) : t.common.opponent}
    </span>
  );
}

export function CampaignMatchView({
  campaign,
  onSimulateOne,
  onSimulateAll,
}: CampaignMatchViewProps) {
  const { locale, t, format } = useLanguage();
  const current = campaign.matches[campaign.currentMatchIndex];
  const played = campaign.matches.filter((m) => m.result);

  if (!current && campaign.phase === "playing") {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          {format(t.common.gameOf, {
            current: campaign.currentMatchIndex + 1,
            total: campaign.matches.length,
          })}
        </p>
        <h2 className="mt-2 text-2xl font-black text-foreground">
          {current ? getCampaignStageLabel(current.matchId, locale) : ""}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.common.yourXi} ({campaign.userTeam?.rating} OVR) {t.common.vs}{" "}
          {current && <OpponentBadge match={current} />}
        </p>
      </div>

      {played.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.common.previousGames}
          </p>
          {played.map((m) => (
            <PitchCard key={m.matchId} className="p-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">
                {getCampaignStageLabel(m.matchId, locale)}
              </p>
              {m.result && m.homeNation && m.awayNation && (
                <ScoreboardHeader
                  homeTeam={m.homeNation}
                  awayTeam={m.awayNation}
                  homeScore={m.result.homeScore}
                  awayScore={m.result.awayScore}
                  label={m.result.wentToPenalties ? t.common.penalties : undefined}
                  compact
                />
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {getMatchNarrativeForCampaign(m, locale)}
              </p>
            </PitchCard>
          ))}
        </div>
      )}

      {current && !current.result && (
        <div className="flex flex-wrap justify-center gap-3">
          <StadiumButton onClick={onSimulateOne}>
            <Play size={16} /> {t.common.simulateGame}
          </StadiumButton>
          <StadiumButton variant="secondary" onClick={onSimulateAll}>
            <FastForward size={16} /> {t.common.simulateAll}
          </StadiumButton>
        </div>
      )}
    </div>
  );
}
