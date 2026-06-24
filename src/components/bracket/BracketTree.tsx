// ---------------------------------------------------------------------------
// WC26 – Bracket Tree Component
// Visual tournament bracket with API-enriched match cards
// ---------------------------------------------------------------------------
"use client";

import { useCallback, useRef } from "react";
import { Check } from "lucide-react";
import { bracketSlots } from "@/data/knockout-bracket";
import { getTeam } from "@/data/teams";
import FlagBadge from "@/components/ui/FlagBadge";
import PitchCard from "@/components/ui/PitchCard";
import MatchStatusBadge from "@/components/ui/MatchStatusBadge";
import ScoreboardHeader from "@/components/ui/ScoreboardHeader";
import BracketConnector from "@/components/bracket/BracketConnector";
import ChampionPedestal from "./ChampionPedestal";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import {
  formatMessage,
  formatShortMatchDate,
  getMessages,
  getTeamName,
  type Locale,
} from "@/lib/i18n";
import { GROUP_PAIRS, type ResolvedBracketMatch } from "@/lib/bracket-resolver";
import type { TeamCode } from "@/types/wc26";

interface BracketTreeProps {
  resolvedMatches: ResolvedBracketMatch[];
  predictions: Record<string, { winner: TeamCode; homeScore?: number; awayScore?: number }>;
  onPredictionChange?: (matchId: string, team: TeamCode) => void;
  onScoreChange?: (matchId: string, side: "home" | "away", value: number) => void;
  readOnly?: boolean;
}

function TeamBadge({
  team,
  label,
  isWinner,
  predScore,
  interactive,
  onSelect,
}: {
  team: TeamCode | null;
  label?: string;
  isWinner?: boolean;
  predScore?: number;
  interactive?: boolean;
  onSelect?: () => void;
}) {
  const { locale, t } = useLanguage();
  const teamData = team && team !== "TBD" ? getTeam(team) : null;

  return (
    <div
      role={interactive && teamData ? "button" : undefined}
      tabIndex={interactive && teamData ? 0 : undefined}
      onClick={interactive && teamData ? onSelect : undefined}
      onKeyDown={
        interactive && teamData
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
      className={`
        flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium
        transition-all duration-150 min-w-[168px] h-[34px]
        ${teamData
          ? isWinner
            ? "bg-grass/15 border border-gold/30 border-l-[3px] border-l-gold text-foreground font-semibold glow-gold"
            : "bg-muted/50 border border-border text-foreground/90"
          : "bg-card/40 border border-dashed border-border text-muted-foreground"
        }
        ${interactive && teamData ? "cursor-pointer hover:opacity-80 active:scale-[0.98]" : ""}
      `}
    >
      {teamData ? (
        <>
          <FlagBadge code={teamData.code as TeamCode} size="sm" className="border-0 bg-transparent px-0 py-0" />
          <span className="flex-1 truncate">{getTeamName(teamData, locale)}</span>
          {predScore !== undefined && (
            <span className="font-scoreboard w-5 text-center text-[10px] font-bold text-led">
              {predScore}
            </span>
          )}
          {isWinner && <Check size={10} className="text-gold shrink-0" />}
        </>
      ) : label ? (
        <span className="text-[10px] italic text-muted-foreground">{label}</span>
      ) : (
        <span className="text-[10px] italic text-muted-foreground/70">{t.common.tbd}</span>
      )}
    </div>
  );
}

function MatchCard({
  match,
  predictions,
  onPredictionChange,
  onScoreChange,
  readOnly,
  cardRef,
}: {
  match: ResolvedBracketMatch;
  predictions: Record<string, { winner: TeamCode; homeScore?: number; awayScore?: number }>;
  onPredictionChange?: (matchId: string, team: TeamCode) => void;
  onScoreChange?: (matchId: string, side: "home" | "away", value: number) => void;
  readOnly?: boolean;
  cardRef?: (el: HTMLDivElement | null) => void;
}) {
  const { locale, t } = useLanguage();
  const pred = predictions[match.matchId];
  const predWinner = pred?.winner;
  const fixture = match.fixture;
  const interactive = !readOnly && !!onPredictionChange;

  const isHomeWinner = match.homeTeam !== null && predWinner === match.homeTeam;
  const isAwayWinner = match.awayTeam !== null && predWinner === match.awayTeam;

  const hasRealScore =
    fixture &&
    (fixture.status === "live" || fixture.status === "finished") &&
    fixture.homeScore !== undefined &&
    fixture.awayScore !== undefined;

  const homeLabel =
    match.round === 1
      ? getR32Label(match.matchId, "home", locale)
      : fixture?.homeTeamLabel;
  const awayLabel =
    match.round === 1
      ? getR32Label(match.matchId, "away", locale)
      : fixture?.awayTeamLabel;

  const isLive = fixture?.status === "live";

  return (
    <div ref={cardRef} data-match-id={match.matchId}>
      <PitchCard live={isLive} glow={isHomeWinner || isAwayWinner} className="p-2">
      <div className="mb-1.5 flex items-center justify-between gap-1">
        <MatchStatusBadge fixture={fixture} compact />
        {!hasRealScore && fixture && (
          <span className="truncate text-[9px] text-muted-foreground">
            {formatShortMatchDate(fixture.date, locale, fixture.time)}
          </span>
        )}
      </div>

      {hasRealScore && match.homeTeam && match.awayTeam && (
        <div className="mb-2">
          <ScoreboardHeader
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            homeScore={fixture!.homeScore!}
            awayScore={fixture!.awayScore!}
            compact
            showFullNames={false}
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <TeamBadge
          team={match.homeTeam}
          label={homeLabel}
          isWinner={isHomeWinner}
          predScore={pred?.homeScore}
          interactive={interactive}
          onSelect={() =>
            match.homeTeam && onPredictionChange?.(match.matchId, match.homeTeam)
          }
        />
        <TeamBadge
          team={match.awayTeam}
          label={awayLabel}
          isWinner={isAwayWinner}
          predScore={pred?.awayScore}
          interactive={interactive}
          onSelect={() =>
            match.awayTeam && onPredictionChange?.(match.matchId, match.awayTeam)
          }
        />
      </div>

      {interactive && (
        <div className="mt-1.5 flex items-center justify-center gap-1.5 border-t border-border/40 pt-1.5">
          <span className="text-[9px] text-muted-foreground">{t.common.predictionShort}</span>
          <input
            type="number"
            min={0}
            max={99}
            value={pred?.homeScore ?? ""}
            placeholder="—"
            onChange={(e) =>
              onScoreChange?.(
                match.matchId,
                "home",
                Math.min(99, Math.max(0, parseInt(e.target.value) || 0)),
              )
            }
            className="font-scoreboard h-5 w-6 rounded border border-grass/40 bg-tunnel-dark text-center text-[10px] font-bold text-led
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
              focus:border-led focus:outline-none"
            aria-label={t.common.predictedHome}
          />
          <span className="text-[9px] text-muted-foreground">×</span>
          <input
            type="number"
            min={0}
            max={99}
            value={pred?.awayScore ?? ""}
            placeholder="—"
            onChange={(e) =>
              onScoreChange?.(
                match.matchId,
                "away",
                Math.min(99, Math.max(0, parseInt(e.target.value) || 0)),
              )
            }
            className="font-scoreboard h-5 w-6 rounded border border-grass/40 bg-tunnel-dark text-center text-[10px] font-bold text-led
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
              focus:border-led focus:outline-none"
            aria-label={t.common.predictedAway}
          />
        </div>
      )}
      </PitchCard>
    </div>
  );
}

export function getR32Label(matchId: string, side: "home" | "away", locale: Locale): string {
  const t = getMessages(locale);
  const slots = bracketSlots.filter((s) => s.matchId === matchId && s.round === 1);
  if (slots.length < 2) return "";

  const homeSlot = slots.find((s) => s.position === 1);
  const awaySlot = slots.find((s) => s.position === 2);
  const slot = side === "home" ? homeSlot : awaySlot;
  if (!slot) return "";

  const idx = bracketSlots.indexOf(slot);
  if (idx === -1) return "";
  const pairIdx = Math.floor(idx / 4);
  const posInPair = idx % 4;

  if (pairIdx < GROUP_PAIRS.length) {
    const pair = GROUP_PAIRS[pairIdx];
    if (!pair) return "";

    const [groupOdd, groupEven] = pair;
    if (posInPair === 0) return formatMessage(t.bracket.r32Labels.first, { group: groupOdd });
    if (posInPair === 1) return formatMessage(t.bracket.r32Labels.second, { group: groupEven });
    if (posInPair === 2) return formatMessage(t.bracket.r32Labels.first, { group: groupEven });
    if (posInPair === 3) return formatMessage(t.bracket.r32Labels.second, { group: groupOdd });
  }

  return t.common.thirdBest;
}

export default function BracketTree({
  resolvedMatches,
  predictions,
  onPredictionChange,
  onScoreChange,
  readOnly = false,
}: BracketTreeProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const ROUND_CONFIG = [
    { label: t.stages.r32, round: 1 },
    { label: t.stages.r16, round: 2 },
    { label: t.stages.qf, round: 3 },
    { label: t.stages.sf, round: 4 },
    { label: t.stages.final, round: 5 },
  ];

  const setCardRef = useCallback((matchId: string) => {
    return (el: HTMLDivElement | null) => {
      if (el) cardRefs.current.set(matchId, el);
      else cardRefs.current.delete(matchId);
    };
  }, []);

  const matchesByRound = new Map<number, ResolvedBracketMatch[]>();
  for (const match of resolvedMatches) {
    const existing = matchesByRound.get(match.round) ?? [];
    existing.push(match);
    matchesByRound.set(match.round, existing);
  }

  const championPred = predictions["final"];

  return (
    <div className="w-full overflow-x-auto pb-6">
      {/* Sticky phase header strip */}
      <div className="sticky top-0 z-20 mb-3 flex gap-3 min-w-[980px] bg-background/80 backdrop-blur-sm py-2 border-b border-border/40">
        {ROUND_CONFIG.map((rc) => (
          <div key={rc.round} className="flex-1 min-w-[190px] text-center">
            <span className="inline-block rounded-full bg-muted/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
              {rc.label}
            </span>
          </div>
        ))}
        <div className="flex-1 min-w-[160px] text-center">
          <span className="inline-block rounded-full bg-accent-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
            {t.common.champion}
          </span>
        </div>
      </div>

      <div ref={containerRef} className="relative flex gap-3 min-w-[980px]">
        <BracketConnector containerRef={containerRef} cardRefs={cardRefs} />

        {ROUND_CONFIG.map((roundCfg) => {
          const roundMatches = matchesByRound.get(roundCfg.round) ?? [];

          return (
            <div key={roundCfg.round} className="flex-1 min-w-[190px] relative z-10">
              {roundCfg.round === 1 ? (
                /* R32: pairs grouped with larger gap between pairs */
                <div className="flex flex-col gap-4">
                  {Array.from({ length: Math.ceil(roundMatches.length / 2) }, (_, pairIdx) => (
                    <div key={pairIdx} className="flex flex-col gap-[5px]">
                      {roundMatches.slice(pairIdx * 2, pairIdx * 2 + 2).map((match) => (
                        <MatchCard
                          key={match.matchId}
                          match={match}
                          predictions={predictions}
                          onPredictionChange={onPredictionChange}
                          onScoreChange={onScoreChange}
                          readOnly={readOnly}
                          cardRef={setCardRef(match.matchId)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {roundMatches.map((match) => (
                    <MatchCard
                      key={match.matchId}
                      match={match}
                      predictions={predictions}
                      onPredictionChange={onPredictionChange}
                      onScoreChange={onScoreChange}
                      readOnly={readOnly}
                      cardRef={setCardRef(match.matchId)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Champion pedestal */}
        <div className="flex-1 min-w-[160px] relative z-10 flex items-center">
          <div className="w-full pt-2">
            <ChampionPedestal winnerCode={championPred?.winner} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
