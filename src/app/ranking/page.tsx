"use client";

import { useEffect, useMemo, useState } from "react";
import { UserPlus, RefreshCw } from "lucide-react";
import { matches as defaultMatches } from "@/data/matches";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import {
  getRankingEntries,
  importFromShare,
  recalculateAllScores,
  removeRankingEntry,
  upsertRankingEntry,
} from "@/lib/local-ranking";
import { normalizeShareHash } from "@/lib/share-token";
import { getPredictions } from "@/lib/bracket-store";
import { applyGroupScoresToMatches, fetchMergedResults } from "@/lib/match-results";
import type { RankingEntry } from "@/lib/local-ranking";
import type { Match } from "@/types/wc26";
import RankingRow from "@/components/ranking/RankingRow";
import StadiumButton from "@/components/ui/StadiumButton";
import StadiumSection from "@/components/ui/StadiumSection";
import PageSkeleton from "@/components/ui/PageSkeleton";

const STORAGE_KEY_SCORES = "wc26-group-scores";

async function loadRankingData(): Promise<{
  live: typeof defaultMatches;
  entries: RankingEntry[];
}> {
  const groupScores = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SCORES);
      return raw ? (JSON.parse(raw) as Record<string, { homeScore: number; awayScore: number; finished: boolean }>) : {};
    } catch {
      return {};
    }
  })();
  const { matches } = await fetchMergedResults();
  const live = applyGroupScoresToMatches(matches, groupScores);
  return { live, entries: recalculateAllScores(live) };
}

export default function RankingPage() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [importHash, setImportHash] = useState("");
  const [importName, setImportName] = useState("");
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resultMatches, setResultMatches] = useState<Match[]>([...defaultMatches]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadRankingData().then(({ live, entries: loaded }) => {
      if (cancelled) return;
      setResultMatches([...live])
      setEntries(loaded);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshScores = async () => {
    const { live, entries: loaded } = await loadRankingData();
    setResultMatches([...live]);
    setEntries(loaded);
  };

  const medals = useMemo(
    () => ["🥇", "🥈", "🥉"] as const,
    [],
  );

  const handleAddSelf = () => {
    const predictions = getPredictions();
    if (Object.keys(predictions).length === 0) {
      setMessage(t.ranking.addFirst);
      return;
    }
    upsertRankingEntry({ name: t.common.you, predictions, score: 0 }, resultMatches);
    setEntries(getRankingEntries());
    setMessage(t.ranking.added);
  };

  const handleImport = async () => {
    if (!importHash.trim()) return;
    setImporting(true);
    try {
      const hash = normalizeShareHash(importHash);
      const res = await fetch(`/api/share?hash=${encodeURIComponent(hash)}`);
      if (!res.ok) throw new Error(t.ranking.importFail);
      const data = (await res.json()) as {
        predictions: RankingEntry["predictions"];
        ownerName?: string;
      };
      importFromShare(
        importName.trim() || data.ownerName || t.common.friend,
        data.predictions,
        hash,
        resultMatches,
      );
      setEntries(getRankingEntries());
      setImportHash("");
      setImportName("");
      setMessage(t.ranking.imported);
    } catch {
      setMessage(t.ranking.importFail);
    } finally {
      setImporting(false);
    }
  };

  const handleRemove = (id: string) => {
    removeRankingEntry(id);
    setEntries(getRankingEntries());
  };

  if (!ready) {
    return <PageSkeleton lines={8} />;
  }

  return (
    <StadiumSection
      accent={t.ranking.accent}
      title={t.ranking.title}
      subtitle={t.ranking.subtitle}
      className="flex flex-1 flex-col items-center"
    >

      {message && (
        <div className="mt-6 max-w-md rounded-lg border border-border bg-muted/80 px-4 py-2 text-sm text-foreground">
          {message}
          <button
            onClick={() => setMessage(null)}
            className="ml-2 text-muted-foreground hover:text-foreground"
            aria-label={t.common.closeMessage}
          >
            ✕
          </button>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <StadiumButton onClick={handleAddSelf}>
          <UserPlus size={16} /> {t.common.addMyBracket}
        </StadiumButton>
        <StadiumButton variant="secondary" onClick={() => void refreshScores()}>
          <RefreshCw size={16} /> {t.common.recalcPoints}
        </StadiumButton>
      </div>

      <div className="mt-8 w-full max-w-md space-y-3 rounded-xl border border-border bg-card/40 p-4">
        <p className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t.common.importViaLink}
        </p>
        <input
          type="text"
          value={importHash}
          onChange={(e) => setImportHash(e.target.value)}
          placeholder={t.common.pasteLink}
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
        />
        <input
          type="text"
          value={importName}
          onChange={(e) => setImportName(e.target.value)}
          placeholder={t.common.participantName}
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
        />
        <StadiumButton
          variant="secondary"
          className="w-full"
          onClick={handleImport}
          disabled={importing || !importHash.trim()}
        >
          {importing ? t.common.importing : t.common.importBracket}
        </StadiumButton>
      </div>

      <div className="mt-10 w-full max-w-md space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t.ranking.empty}
          </p>
        ) : (
          entries.map((row, i) => (
            <RankingRow
              key={row.id}
              entry={row}
              rank={i + 1}
              medal={i < 3 ? medals[i] : undefined}
              onRemove={handleRemove}
            />
          ))
        )}
      </div>
    </StadiumSection>
  );
}
