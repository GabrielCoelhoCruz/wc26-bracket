"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, UserPlus, Trash2, Trophy } from "lucide-react";
import { matches as defaultMatches } from "@/data/matches";
import { getTeam } from "@/data/teams";
import { resolveFullBracket } from "@/lib/bracket-resolver";
import {
  addPoolParticipant,
  comparePoolBrackets,
  ensureLocalPool,
  getChampionPick,
  getLocalPool,
  removePoolParticipant,
  type LocalPool,
} from "@/lib/local-pool";
import { applyGroupScoresToMatches, fetchMergedResults } from "@/lib/match-results";
import { getPredictions } from "@/lib/bracket-store";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { getTeamName } from "@/lib/i18n";
import { normalizeShareHash } from "@/lib/share-token";
import BracketTree from "@/components/bracket/BracketTree";
import StadiumButton from "@/components/ui/StadiumButton";
import PageSkeleton from "@/components/ui/PageSkeleton";

const STORAGE_KEY_SCORES = "wc26-group-scores";

export default function BolaoPage() {
  const { t, locale } = useLanguage();
  const [pool, setPool] = useState<LocalPool | null>(null);
  const [importHash, setImportHash] = useState("");
  const [importName, setImportName] = useState("");
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resultMatches, setResultMatches] = useState([...defaultMatches]);
  const [ready, setReady] = useState(false);
  const [previewPredictions, setPreviewPredictions] = useState<Record<string, { winner: string }> | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const groupScores = (() => {
        try {
          const raw = localStorage.getItem(STORAGE_KEY_SCORES);
          return raw ? (JSON.parse(raw) as Record<string, { homeScore: number; awayScore: number; finished: boolean }>) : {};
        } catch {
          return {};
        }
      })();
      const { matches } = await fetchMergedResults();
      if (cancelled) return;
      const live = applyGroupScoresToMatches(matches, groupScores);
      setResultMatches(live);
      setPool(getLocalPool() ?? ensureLocalPool(t.bolao.defaultName));
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [t.bolao.defaultName]);

  const liveMatches = resultMatches;
  const comparisons = useMemo(
    () => (pool ? comparePoolBrackets(pool, locale) : []),
    [pool, locale],
  );

  const disagreements = useMemo(
    () => comparisons.filter((c) => c.disagreements > 0),
    [comparisons],
  );

  const handleAddSelf = () => {
    const predictions = getPredictions();
    if (Object.keys(predictions).length === 0) {
      setMessage(t.bolao.addFirst);
      return;
    }
    addPoolParticipant(t.common.you, predictions, liveMatches);
    setPool(getLocalPool());
    setMessage(t.bolao.joined);
  };

  const handleImport = async () => {
    if (!importHash.trim()) return;
    setImporting(true);
    try {
      const hash = normalizeShareHash(importHash);
      const res = await fetch(`/api/share?hash=${encodeURIComponent(hash)}`);
      if (!res.ok) throw new Error("invalid");
      const data = (await res.json()) as {
        predictions: Record<string, { winner: string }>;
        ownerName?: string;
      };
      addPoolParticipant(
        importName.trim() || data.ownerName || t.common.friend,
        data.predictions,
        liveMatches,
        hash,
      );
      setPool(getLocalPool());
      setImportHash("");
      setImportName("");
      setMessage(t.bolao.added);
    } catch {
      setMessage(t.bolao.importFail);
    } finally {
      setImporting(false);
    }
  };

  const handlePreview = (predictions: Record<string, { winner: string }>) => {
    setPreviewPredictions(predictions);
  };

  if (!ready || !pool) {
    return <PageSkeleton lines={6} />;
  }

  const resolvedPreview = previewPredictions
    ? resolveFullBracket(previewPredictions, liveMatches, locale)
    : [];

  return (
    <div className="flex flex-1 flex-col px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-4xl text-center">
        <p className="text-accent text-sm font-bold tracking-widest mb-4 uppercase">
          {t.bolao.accent}
        </p>
        <h1 className="flex items-center justify-center gap-2 text-3xl font-black text-foreground sm:text-4xl">
          <Users size={28} className="text-accent" />
          {pool.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.bolao.compare} · {pool.participants.length} {t.common.participants}
        </p>
      </div>

      {message && (
        <div className="mx-auto mt-6 max-w-md rounded-lg border border-border bg-muted/80 px-4 py-2 text-center text-sm text-foreground">
          {message}
          <button onClick={() => setMessage(null)} className="ml-2 text-muted-foreground" aria-label={t.common.closeMessage}>
            ✕
          </button>
        </div>
      )}

      <div className="mx-auto mt-8 flex flex-wrap justify-center gap-3">
        <StadiumButton onClick={handleAddSelf}>
          <UserPlus size={16} /> {t.common.enterWithBracket}
        </StadiumButton>
      </div>

      <div className="mx-auto mt-6 w-full max-w-md space-y-3 rounded-xl border border-border bg-card/40 p-4">
        <p className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t.common.addFriendLink}
        </p>
        <input
          type="text"
          value={importHash}
          onChange={(e) => setImportHash(e.target.value)}
          placeholder={t.common.linkOrHash}
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        />
        <input
          type="text"
          value={importName}
          onChange={(e) => setImportName(e.target.value)}
          placeholder={t.common.nameOptional}
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        />
        <StadiumButton
          variant="secondary"
          className="w-full"
          onClick={handleImport}
          disabled={importing}
        >
          {importing ? t.common.importing : t.common.addToBolao}
        </StadiumButton>
      </div>

      <div className="mx-auto mt-10 w-full max-w-2xl space-y-3">
        <h2 className="text-left text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {t.common.participants}
        </h2>
        {pool.participants.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.common.noneYet}</p>
        ) : (
          pool.participants
            .sort((a, b) => b.score - a.score)
            .map((p) => {
              const champion = getChampionPick(p.predictions);
              const champTeam = champion ? getTeam(champion) : null;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card/60 px-5 py-4"
                >
                  <div className="flex-1 text-left">
                    <div className="font-bold text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.common.championPick}: {champTeam ? `${champTeam.flag} ${getTeamName(champTeam, locale)}` : "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-black text-accent">
                    <Trophy size={14} />
                    {p.score}
                  </div>
                  <button
                    onClick={() => handlePreview(p.predictions)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/60"
                  >
                    {t.common.view}
                  </button>
                  <button
                    onClick={() => {
                      removePoolParticipant(p.id);
                      setPool(getLocalPool());
                    }}
                    className="text-muted-foreground hover:text-red-400"
                    aria-label={`${t.common.remove} ${p.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
        )}
      </div>

      {disagreements.length > 0 && (
        <div className="mx-auto mt-10 w-full max-w-2xl">
          <h2 className="mb-4 text-left text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {t.common.disagreements} ({disagreements.length})
          </h2>
          <div className="space-y-3">
            {disagreements.slice(0, 12).map((c) => (
              <div
                key={c.matchId}
                className="rounded-xl border border-border bg-card/40 p-4 text-left"
              >
                <div className="mb-2 text-xs font-bold uppercase text-accent">
                  {c.label}
                </div>
                <ul className="space-y-1">
                  {c.picks.map((pick) => (
                    <li key={pick.name} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{pick.name}</span>
                      <span className="font-medium text-foreground">{pick.winnerLabel}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {previewPredictions && (
        <div className="mx-auto mt-10 w-full max-w-7xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {t.common.bracketPreview}
            </h2>
            <button
              onClick={() => setPreviewPredictions(null)}
              className="text-sm text-muted-foreground hover:text-muted-foreground"
            >
              {t.common.close}
            </button>
          </div>
          <div className="rounded-xl border border-border bg-card/30 p-4 overflow-x-auto">
            <BracketTree
              resolvedMatches={resolvedPreview}
              predictions={previewPredictions}
              readOnly
            />
          </div>
        </div>
      )}
    </div>
  );
}
