// ---------------------------------------------------------------------------
// WC26 – Bracket Page
// Complete interactive bracket with group standings + knockout tree
// ---------------------------------------------------------------------------
"use client";

import { useEffect, useMemo, useState, useCallback, useSyncExternalStore } from "react";
import { Share2, Calendar, CheckCircle2, Dices } from "lucide-react";
import Link from "next/link";
import { matches as defaultMatches } from "@/data/matches";
import { getAllTeams, getTeam } from "@/data/teams";
import { useCatalogVersion } from "@/components/catalog/CatalogProvider";
import { resolveFullBracket, getKnockoutFixtures } from "@/lib/bracket-resolver";
import LiveIndicator from "@/components/ui/LiveIndicator";
import ScoreboardHeader from "@/components/ui/ScoreboardHeader";
import PitchCard from "@/components/ui/PitchCard";
import { savePrediction, getPredictions, resetPredictions, predictionCount } from "@/lib/bracket-store";
import { calculateScore } from "@/lib/bracket-score";
import { applyGroupScoresToMatches, fetchMergedResults } from "@/lib/match-results";
import { buildShareText } from "@/lib/share-token";
import { formatLocaleTime } from "@/lib/i18n";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { countLiveMatches, useLiveMatchPolling } from "@/hooks/useLiveMatchPolling";
import { getOwnerName, setOwnerName, upsertRankingEntry } from "@/lib/local-ranking";
import GroupsStageView from "@/components/bracket/GroupsStageView";
import KnockoutBracketView from "@/components/bracket/KnockoutBracketView";
import type { TeamCode } from "@/types/wc26";
import type { Match } from "@/types/wc26";

const STORAGE_KEY_SCORES = "wc26-group-scores";

const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface GroupMatchScore {
  homeScore: number;
  awayScore: number;
  finished: boolean;
}


function MatchSummaryStrip({
  matches,
  liveCount,
  resultsSource,
  lastRefreshedAt,
  loading,
}: {
  matches: Match[];
  liveCount: number;
  resultsSource: "api" | "static";
  lastRefreshedAt: Date | null;
  loading: boolean;
}) {
  const { t, locale } = useLanguage();
  const upcoming = matches.filter((m) => m.status === "scheduled").length;
  const finished = matches.filter((m) => m.status === "finished").length;
  const recentResults = matches
    .filter((m) => m.status === "finished" && m.homeScore !== undefined)
    .slice(-3)
    .reverse();

  return (
    <PitchCard className="mx-auto mb-6 max-w-4xl p-4">
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          {liveCount > 0 ? (
            <LiveIndicator label={`${liveCount} ${t.common.live.toUpperCase()}`} className="text-[10px]" />
          ) : (
            <>
              <span className="font-bold text-foreground">0</span>
              <span className="text-muted-foreground">{t.common.liveCount}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-accent" />
          <span className="font-bold text-foreground">{upcoming}</span>
          <span className="text-muted-foreground">{t.common.upcoming}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} className="text-pitch" />
          <span className="font-bold text-foreground">{finished}</span>
          <span className="text-muted-foreground">{t.common.finished}</span>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        {t.common.source}: {resultsSource === "api" ? t.common.sourceApi : t.common.sourceLocal}
        {lastRefreshedAt && ` · ${t.common.updatedAt} ${formatLocaleTime(lastRefreshedAt, locale)}`}
        {loading && ` · ${t.common.syncing}`}
      </p>
      {recentResults.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-2 border-t border-border/50 pt-3">
          <span className="w-full text-center text-[10px] uppercase tracking-wider text-muted-foreground">
            {t.common.lastResults}
          </span>
          {recentResults.map((m) => (
            <ScoreboardHeader
              key={m.id}
              homeTeam={m.homeTeam}
              awayTeam={m.awayTeam}
              homeScore={m.homeScore ?? 0}
              awayScore={m.awayScore ?? 0}
              compact
              showFullNames={false}
              className="max-w-xs"
            />
          ))}
        </div>
      )}
    </PitchCard>
  );
}

// -----------------------------------------------------------------------
// Main Page
// -----------------------------------------------------------------------
function loadInitialGroupScores(): Record<string, GroupMatchScore> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SCORES);
    return saved ? (JSON.parse(saved) as Record<string, GroupMatchScore>) : {};
  } catch {
    return {};
  }
}

function BracketPageInner() {
  const { t, locale } = useLanguage();
  const catalogVersion = useCatalogVersion();
  const [groupScores, setGroupScores] = useState(loadInitialGroupScores);
  const [predictions, setPredictions] = useState(getPredictions);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"groups" | "bracket">("groups");
  const [simulating, setSimulating] = useState(false);
  const [resultMatches, setResultMatches] = useState<Match[]>([...defaultMatches]);
  const [resultsSource, setResultsSource] = useState<"api" | "static">("static");
  const [ownerName, setOwnerNameState] = useState(getOwnerName);
  const [sharing, setSharing] = useState(false);
  const [loadingResults, setLoadingResults] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchMergedResults()
      .then(({ matches, source }) => {
        if (cancelled) return;
        setResultMatches(matches);
        setResultsSource(source);
        setLastRefreshedAt(new Date());
      })
      .finally(() => {
        if (!cancelled) setLoadingResults(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useLiveMatchPolling({
    enabled: !loadingResults,
    onUpdate: (matches, source) => {
      setResultMatches(matches);
      setResultsSource(source);
      setLastRefreshedAt(new Date());
    },
  });

  const liveCount = useMemo(
    () => countLiveMatches(resultMatches),
    [resultMatches],
  );

  const liveMatches = useMemo(() => {
    return applyGroupScoresToMatches(resultMatches, groupScores);
  }, [groupScores, resultMatches]);

  const knockoutFixtures = useMemo(
    () => getKnockoutFixtures(liveMatches),
    [liveMatches],
  );

  // Persist group scores
  const persistScores = useCallback((scores: Record<string, GroupMatchScore>) => {
    try {
      localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(scores));
    } catch {}
  }, []);

  // Handle score change
  const handleScoreChange = useCallback(
    (matchId: string, field: "homeScore" | "awayScore" | "finished", value: number | boolean) => {
      setGroupScores((prev) => {
        const current = prev[matchId] ?? { homeScore: 0, awayScore: 0, finished: false };
        const next = {
          ...prev,
          [matchId]: {
            homeScore: field === "homeScore" ? (value as number) : current.homeScore,
            awayScore: field === "awayScore" ? (value as number) : current.awayScore,
            finished: field === "finished" ? (value as boolean) : current.finished,
          },
        };
        persistScores(next);
        return next;
      });
    },
    [persistScores],
  );

  const scoreResult = useMemo(() => {
    return calculateScore(predictions, liveMatches);
  }, [predictions, liveMatches]);

  // Group matches by group letter
  const groupLetters = useMemo(() => {
    const set = new Set<string>();
    for (const t of getAllTeams()) if (t.group) set.add(t.group);
    return Array.from(set).sort();
  }, [catalogVersion]);

  const groupMatchesMap = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of liveMatches) {
      if (m.stage === "group" && m.group) {
        const existing = map.get(m.group) ?? [];
        existing.push(m);
        map.set(m.group, existing);
      }
    }
    return map;
  }, [liveMatches]);

  // Resolve the full bracket from live results
  const resolvedMatches = useMemo(() => {
    return resolveFullBracket(predictions, liveMatches, locale);
  }, [predictions, liveMatches, locale]);

  // Handle prediction change
  const handlePredictionChange = useCallback(
    (matchId: string, team: TeamCode) => {
      setPredictions((prev) => {
        const current = prev[matchId];
        // Toggle: if same team is already selected, deselect
        const next = current?.winner === team
          ? { ...prev }
          : { ...prev, [matchId]: { ...current, winner: team } };

        if (current?.winner === team) {
          delete next[matchId];
        }

        // Persist
        savePrediction(matchId, next[matchId] ?? { winner: team });
        return next;
      });
    },
    [],
  );

  const handleScoreChange2 = useCallback(
    (matchId: string, side: "home" | "away", value: number) => {
      setPredictions((prev) => {
        const current = prev[matchId] ?? { winner: "" as TeamCode };
        const next = {
          ...prev,
          [matchId]: {
            ...current,
            [side === "home" ? "homeScore" : "awayScore"]: value,
          },
        };
        savePrediction(matchId, next[matchId]);
        return next;
      });
    },
    [],
  );

  const handleReset = useCallback(() => {
    resetPredictions();
    setPredictions({});
    setGroupScores({});
    try { localStorage.removeItem(STORAGE_KEY_SCORES); } catch {}
    setMessage(t.bracket.allCleared);
  }, [t.bracket.allCleared]);

  // Simulate group results based on team ratings
  const handleSimulate = useCallback(() => {
    setSimulating(true);
    const newScores: Record<string, GroupMatchScore> = {};

    for (const m of defaultMatches) {
      if (m.stage !== "group") continue;

      const homeRating = getTeam(m.homeTeam)?.rating ?? 50;
      const awayRating = getTeam(m.awayTeam)?.rating ?? 50;

      // Simple simulation: higher rating = more likely to score
      const homeStrength = homeRating / 100;
      const awayStrength = awayRating / 100;
      const totalStrength = homeStrength + awayStrength;

      // Generate scores weighted by rating
      const homeExpected = (homeStrength / totalStrength) * 3;
      const awayExpected = (awayStrength / totalStrength) * 3;

      // Add some randomness
      const homeScore = Math.max(0, Math.round(homeExpected + (Math.random() - 0.3) * 1.5));
      const awayScore = Math.max(0, Math.round(awayExpected + (Math.random() - 0.3) * 1.5));

      newScores[m.id] = { homeScore, awayScore, finished: true };
    }

    setGroupScores(newScores);
    persistScores(newScores);
    setSimulating(false);
    setMessage(t.bracket.groupsSimulated);
  }, [persistScores, t.bracket.groupsSimulated]);

  const handleRefreshResults = useCallback(async () => {
    setLoadingResults(true);
    try {
      const { matches, source } = await fetchMergedResults();
      setResultMatches(matches);
      setResultsSource(source);
      setLastRefreshedAt(new Date());
      setMessage(
        source === "api"
          ? t.bracket.resultsUpdated
          : t.bracket.usingLocal,
      );
    } finally {
      setLoadingResults(false);
    }
  }, [t.bracket.resultsUpdated, t.bracket.usingLocal]);

  const handleShare = useCallback(async () => {
    setSharing(true);
    try {
      if (ownerName.trim()) setOwnerName(ownerName.trim());
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          predictions,
          ownerName: ownerName.trim() || undefined,
          locale: locale === "en-US" ? "en" : undefined,
        }),
      });
      if (!res.ok) throw new Error(t.bracket.shareFail);
      const data = (await res.json()) as { hash: string; url: string; shareText: string };
      const shareText = `${buildShareText(ownerName.trim() || undefined, locale)}\n${data.url}`;
      await navigator.clipboard.writeText(shareText);
      upsertRankingEntry(
        {
          name: ownerName.trim() || t.common.you,
          predictions,
          score: scoreResult.total,
        },
        liveMatches,
      );
      setMessage(t.bracket.shareCopied);
    } catch {
      setMessage(t.bracket.shareError);
    } finally {
      setSharing(false);
    }
  }, [predictions, ownerName, scoreResult.total, liveMatches, locale, t]);

  // Count completed groups
  const completedGroups = groupLetters.filter((g) => {
    const gm = groupMatchesMap.get(g) ?? [];
    return gm.length > 0 && gm.every((m) => m.status === "finished");
  }).length;

  return (
    <main className="flex flex-1 flex-col px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-accent">
            {t.bracket.accent}
          </p>
          <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-5xl">
            {t.bracket.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {predictionCount()} {t.common.predictions} · {completedGroups}/{groupLetters.length} {t.bracket.groupsCompleted}
            {scoreResult.total > 0 && (
              <span className="ml-2 font-bold text-accent">
                · {scoreResult.total} {t.common.pts}
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80">
            {t.common.source}: {resultsSource === "api" ? t.common.sourceApi : t.common.sourceLocalTitle}
            {liveCount > 0 && ` · ${liveCount} ${t.common.liveCount}`}
            {loadingResults && ` · ${t.common.updating}`}
          </p>
        </div>

        {/* Message toast */}
        {message && (
          <div className="mx-auto max-w-lg mb-6">
            <div className="rounded-lg border border-border bg-muted/80 px-4 py-2.5 text-center text-sm text-foreground">
              {message}
              <button
                onClick={() => setMessage(null)}
                className="ml-3 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab("groups")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "groups"
                ? "bg-pitch text-white shadow-lg shadow-pitch/20"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            📊 {t.common.groupsTab}
          </button>
          <button
            onClick={() => setActiveTab("bracket")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "bracket"
                ? "bg-pitch text-white shadow-lg shadow-pitch/20"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            🏆 {t.common.knockoutTab}
          </button>
        </div>

        {/* Owner name + actions */}
        <div className="mx-auto max-w-md mb-6">
          <label htmlFor="owner-name" className="sr-only">
            {t.common.yourName}
          </label>
          <input
            id="owner-name"
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerNameState(e.target.value)}
            onBlur={() => ownerName.trim() && setOwnerName(ownerName.trim())}
            placeholder={t.common.yourNameShare}
            className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="rounded-lg bg-pitch px-5 py-2.5 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
          >
            {simulating ? t.common.simulating : `🎲 ${t.common.simulateGroups}`}
          </button>
          <button
            onClick={handleRefreshResults}
            disabled={loadingResults}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-bold text-foreground transition-all hover:border-accent/50 disabled:opacity-50"
          >
            {loadingResults ? t.common.refreshing : `📡 ${t.common.refreshResults}`}
          </button>
          <Link
            href="/draft?from=bracket"
            className="inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/10 px-5 py-2.5 text-sm font-bold text-foreground transition-all hover:bg-accent/20"
          >
            <Dices size={16} />
            {t.common.buildXiSimulate}
          </Link>
          <button
            onClick={handleShare}
            disabled={sharing || predictionCount() === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-background transition-all hover:brightness-110 disabled:opacity-50"
          >
            <Share2 size={16} />
            {sharing ? t.common.sharing : t.common.shareBracket}
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:border-danger/50"
          >
            🔄 {t.common.resetAll}
          </button>
        </div>

        <MatchSummaryStrip
          matches={liveMatches}
          liveCount={liveCount}
          resultsSource={resultsSource}
          lastRefreshedAt={lastRefreshedAt}
          loading={loadingResults}
        />

        {/* ────────────── GROUPS TAB ────────────── */}
        {activeTab === "groups" && (
          <GroupsStageView
            groupMatchesMap={groupMatchesMap}
            groupScores={groupScores}
            onScoreChange={handleScoreChange}
          />
        )}

        {/* ────────────── BRACKET TAB ────────────── */}
        {activeTab === "bracket" && (
          <KnockoutBracketView
            resolvedMatches={resolvedMatches}
            predictions={predictions}
            onPredictionChange={handlePredictionChange}
            onScoreChange={handleScoreChange2}
            scoreTotal={scoreResult.total}
            scoreBreakdown={scoreResult.breakdown}
            knockoutFixtures={knockoutFixtures}
          />
        )}
      </div>
    </main>
  );
}

export default function BracketPage() {
  const isClient = useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);
  const { t } = useLanguage();

  if (!isClient) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        {t.common.loading}
      </main>
    );
  }

  return <BracketPageInner />;
}
