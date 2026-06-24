"use client";

import { useEffect, useState, useMemo } from "react";
import { Share2, Copy, Check, AlertCircle, ArrowRight } from "lucide-react";
import { buildShareUrl, buildShareText } from "@/lib/share-token";
import { resolveFullBracket } from "@/lib/bracket-resolver";
import { matches as defaultMatches } from "@/data/matches";
import BracketTree from "@/components/bracket/BracketTree";
import ScoreboardHeader from "@/components/ui/ScoreboardHeader";
import StadiumButton from "@/components/ui/StadiumButton";
import StadiumSection from "@/components/ui/StadiumSection";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { getTeamName, type Locale } from "@/lib/i18n";
import type { BracketPrediction } from "@/types/wc26";
import { getTeam } from "@/data/teams";

interface SharedBracketViewProps {
  hash: string;
  predictions: BracketPrediction;
  ownerName?: string;
  syncLocale?: Locale;
}

export default function SharedBracketView({
  hash,
  predictions,
  ownerName,
  syncLocale,
}: SharedBracketViewProps) {
  const { t, locale, setLocale, format } = useLanguage();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    if (syncLocale) {
      setLocale(syncLocale);
    }
  }, [syncLocale, setLocale]);

  const shareUrl = buildShareUrl(hash, locale);
  const shareText = `${buildShareText(ownerName, locale)}\n${shareUrl}`;

  const resolvedMatches = useMemo(
    () => resolveFullBracket(predictions, defaultMatches, locale),
    [predictions, locale],
  );

  const champion = predictions["final"]?.winner;
  const champTeam = champion ? getTeam(champion) : null;
  const finalMatch = useMemo(
    () => resolvedMatches.find((m) => m.matchId === "final"),
    [resolvedMatches],
  );
  const finalPred = predictions["final"];

  const predictionCount = Object.keys(predictions).length;
  const subtitle = champTeam
    ? format(t.share.subtitle, { count: predictionCount }) +
      format(t.share.subtitleChampion, {
        flag: champTeam.flag,
        name: getTeamName(champTeam, locale),
      })
    : format(t.share.subtitle, { count: predictionCount });

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

  return (
    <StadiumSection
      accent={t.share.accent}
      title={ownerName ? format(t.share.titleOwner, { name: ownerName }) : t.share.title}
      subtitle={subtitle}
      className="flex flex-1 flex-col items-center"
    >
      {finalPred?.winner && finalMatch?.homeTeam && finalMatch?.awayTeam && (
        <div className="mt-6 w-full max-w-lg">
          <ScoreboardHeader
            homeTeam={finalMatch.homeTeam}
            awayTeam={finalMatch.awayTeam}
            homeScore={finalPred.homeScore ?? 0}
            awayScore={finalPred.awayScore ?? 0}
            label={format(t.share.finalPrediction, {
              name: getTeamName(champTeam, locale) || finalPred.winner,
            })}
          />
        </div>
      )}

      {predictionCount > 0 && (
        <div className="mt-10 w-full max-w-7xl overflow-x-auto rounded-2xl border border-border bg-card/30 p-4 sm:p-6">
          <BracketTree
            resolvedMatches={resolvedMatches}
            predictions={predictions}
            readOnly
          />
        </div>
      )}

      <div className="mt-8 flex w-full max-w-lg flex-col items-center gap-4">
        <StadiumButton href="/bracket" size="lg" className="w-full">
          {t.common.makeMyBracket}
          <ArrowRight size={18} />
        </StadiumButton>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
        <button
          onClick={handleCopyLink}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {copiedLink ? <Check size={18} /> : <Copy size={18} />}
          {copiedLink ? t.common.linkCopied : t.common.copyLink}
        </button>
        <button
          onClick={handleCopyText}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          {copiedText ? <Check size={18} /> : <Share2 size={18} />}
          {copiedText ? t.common.textCopied : t.common.copyLinkText}
        </button>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {t.share.importRanking}{" "}
        <a href="/ranking" className="text-accent hover:underline">
          {t.ranking.accent}
        </a>{" "}
        {t.share.or}{" "}
        <a href="/bolao" className="text-accent hover:underline">
          {t.nav.bolao}
        </a>
      </p>

      {predictionCount === 0 && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
          <AlertCircle size={16} />
          {t.share.noPredictions}
        </div>
      )}
    </StadiumSection>
  );
}
