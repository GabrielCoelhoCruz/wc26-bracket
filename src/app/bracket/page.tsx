// ---------------------------------------------------------------------------
// WC26 – Bracket Page
// Complete interactive bracket with group standings + knockout tree
// ---------------------------------------------------------------------------
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { matches as defaultMatches } from "@/data/matches";
import { teams, getTeam } from "@/data/teams";
// group-standings lib available for advanced calculations
import { resolveFullBracket } from "@/lib/bracket-resolver";
import { savePrediction, getPredictions, resetPredictions, predictionCount } from "@/lib/bracket-store";
import BracketTree from "@/components/bracket/BracketTree";
import type { TeamCode } from "@/types/wc26";
import type { Match } from "@/types/wc26";

const STORAGE_KEY_SCORES = "wc26-group-scores";

interface GroupMatchScore {
  homeScore: number;
  awayScore: number;
  finished: boolean;
}

// -----------------------------------------------------------------------
// Group Stage Results Editor
// -----------------------------------------------------------------------
function GroupMatchRow({
  match,
  scores,
  onScoreChange,
}: {
  match: Match;
  scores: Record<string, GroupMatchScore>;
  onScoreChange: (matchId: string, field: "homeScore" | "awayScore" | "finished", value: number | boolean) => void;
}) {
  const s = scores[match.id];
  const homeScore = s?.homeScore ?? 0;
  const awayScore = s?.awayScore ?? 0;
  const finished = s?.finished ?? false;

  const homeTeam = getTeam(match.homeTeam);
  const awayTeam = getTeam(match.awayTeam);

  return (
    <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-zinc-800/40 border border-zinc-700/30 text-xs">
      <span className="w-6 text-zinc-500 font-mono">{match.group}</span>
      <span className="w-28 text-right truncate text-zinc-200">
        {homeTeam?.flag} {homeTeam?.namePt ?? match.homeTeam}
      </span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          max={20}
          value={finished ? homeScore : ""}
          placeholder="-"
          disabled={!finished}
          onChange={(e) =>
            onScoreChange(match.id, "homeScore", Math.min(20, Math.max(0, parseInt(e.target.value) || 0)))
          }
          className="w-8 h-7 rounded bg-zinc-900 border border-zinc-600 text-center text-xs text-white font-bold
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            focus:border-[#fbbf24] focus:outline-none disabled:opacity-40"
        />
        <span className="text-zinc-600 font-mono">x</span>
        <input
          type="number"
          min={0}
          max={20}
          value={finished ? awayScore : ""}
          placeholder="-"
          disabled={!finished}
          onChange={(e) =>
            onScoreChange(match.id, "awayScore", Math.min(20, Math.max(0, parseInt(e.target.value) || 0)))
          }
          className="w-8 h-7 rounded bg-zinc-900 border border-zinc-600 text-center text-xs text-white font-bold
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            focus:border-[#fbbf24] focus:outline-none disabled:opacity-40"
        />
      </div>
      <span className="w-28 truncate text-zinc-200">
        {awayTeam?.flag} {awayTeam?.namePt ?? match.awayTeam}
      </span>
      <button
        onClick={() => onScoreChange(match.id, "finished", !finished)}
        className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
          finished
            ? "bg-[#1a5c2a] text-white"
            : "bg-zinc-700/50 text-zinc-400 hover:bg-zinc-600/50"
        }`}
      >
        {finished ? "✅" : "⏳"}
      </button>
    </div>
  );
}

// -----------------------------------------------------------------------
// Group Standings Table
// -----------------------------------------------------------------------
function GroupTable({ group, groupMatches }: { group: string; groupMatches: Match[] }) {
  // Build standings from actual match data
  const standings = useMemo(() => {
    const set = new Map<string, {
      team: string; played: number; won: number; drawn: number; lost: number;
      gf: number; ga: number; pts: number;
    }>();

    // Initialize
    for (const t of teams.filter((t) => t.group === group)) {
      set.set(t.code, { team: t.code, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 });
    }

    for (const m of groupMatches) {
      if (m.homeScore === undefined || m.awayScore === undefined) continue;
      const h = set.get(m.homeTeam);
      const a = set.get(m.awayTeam);
      if (!h || !a) continue;

      h.played++; a.played++;
      h.gf += m.homeScore; h.ga += m.awayScore;
      a.gf += m.awayScore; a.ga += m.homeScore;

      if (m.homeScore > m.awayScore) { h.won++; h.pts += 3; a.lost++; }
      else if (m.awayScore > m.homeScore) { a.won++; a.pts += 3; h.lost++; }
      else { h.drawn++; a.drawn++; h.pts++; a.pts++; }
    }

    const sorted = Array.from(set.values()).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      const gdA = a.gf - a.ga;
      const gdB = b.gf - b.ga;
      if (gdB !== gdA) return gdB - gdA;
      return b.gf - a.gf;
    });

    return sorted;
  }, [group, groupMatches]);

  const totalPlayed = groupMatches.filter((m) => m.homeScore !== undefined).length;
  const isComplete = groupMatches.length > 0 && totalPlayed === groupMatches.length;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-[#fbbf24]">GRUPO {group}</h4>
        {isComplete && (
          <span className="text-[10px] text-[#1a5c2a] font-bold">✅ Completo</span>
        )}
      </div>
      <table className="w-full text-[11px]">
        <thead>
          <tr className="text-zinc-500 uppercase tracking-wider">
            <th className="text-left py-1 pr-2">#</th>
            <th className="text-left py-1 pr-2">Time</th>
            <th className="text-center py-1 px-1">P</th>
            <th className="text-center py-1 px-1">J</th>
            <th className="text-center py-1 px-1">V</th>
            <th className="text-center py-1 px-1">E</th>
            <th className="text-center py-1 px-1">D</th>
            <th className="text-center py-1 px-1">GP</th>
            <th className="text-center py-1 px-1">GC</th>
            <th className="text-center py-1 px-1">SG</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => {
            const team = getTeam(row.team);
            const qualified = i < 2;
            return (
              <tr
                key={row.team}
                className={`border-t border-zinc-800/50 ${
                  qualified ? "text-white" : "text-zinc-500"
                }`}
              >
                <td className="py-1 pr-2 font-mono">{i + 1}</td>
                <td className="py-1 pr-2 flex items-center gap-1">
                  <span>{team?.flag}</span>
                  <span className="truncate max-w-[80px]">{team?.namePt ?? row.team}</span>
                  {qualified && <span className="text-[#fbbf24] text-[10px]">★</span>}
                </td>
                <td className="text-center py-1 px-1 font-bold">{row.pts}</td>
                <td className="text-center py-1 px-1">{row.played}</td>
                <td className="text-center py-1 px-1">{row.won}</td>
                <td className="text-center py-1 px-1">{row.drawn}</td>
                <td className="text-center py-1 px-1">{row.lost}</td>
                <td className="text-center py-1 px-1">{row.gf}</td>
                <td className="text-center py-1 px-1">{row.ga}</td>
                <td className="text-center py-1 px-1">{row.gf - row.ga}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// -----------------------------------------------------------------------
// Main Page
// -----------------------------------------------------------------------
export default function BracketPage() {
  const [isClient, setIsClient] = useState(false);
  const [groupScores, setGroupScores] = useState<Record<string, GroupMatchScore>>({});
  const [predictions, setPredictions] = useState<Record<string, { winner: TeamCode; homeScore?: number; awayScore?: number }>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"groups" | "bracket">("groups");
  const [simulating, setSimulating] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCORES);
      if (saved) setGroupScores(JSON.parse(saved));
    } catch {}
    setPredictions(getPredictions());
  }, []);

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

  // Merge default matches with user scores
  const liveMatches = useMemo(() => {
    return defaultMatches.map((m) => {
      const score = groupScores[m.id];
      if (score?.finished) {
        return {
          ...m,
          homeScore: score.homeScore,
          awayScore: score.awayScore,
          status: "finished" as const,
        };
      }
      return m;
    });
  }, [groupScores]);

  // Group matches by group letter
  const groupLetters = useMemo(() => {
    const set = new Set<string>();
    for (const t of teams) if (t.group) set.add(t.group);
    return Array.from(set).sort();
  }, []);

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
    return resolveFullBracket(predictions);
  }, [predictions, liveMatches]);

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
    setMessage("Tudo limpo — resultados e palpites resetados");
  }, []);

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
    setMessage("Resultados dos grupos simulados com base nos ratings!");
  }, [persistScores]);

  // Count completed groups
  const completedGroups = groupLetters.filter((g) => {
    const gm = groupMatchesMap.get(g) ?? [];
    return gm.length > 0 && gm.every((m) => m.status === "finished");
  }).length;

  if (!isClient) {
    return (
      <main className="flex min-h-screen items-center justify-center text-zinc-400">
        Carregando...
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[#fbbf24] text-sm font-bold tracking-widest mb-3 uppercase">
            Copa do Mundo 2026
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2">
            Bracket do Mata-Mata
          </h1>
          <p className="text-zinc-400 text-sm">
            {predictionCount()} palpite(s) · {completedGroups}/{groupLetters.length} grupos concluídos
          </p>
        </div>

        {/* Message toast */}
        {message && (
          <div className="mx-auto max-w-lg mb-6">
            <div className="rounded-lg bg-zinc-800/80 px-4 py-2.5 text-sm text-zinc-200 text-center border border-zinc-700/50">
              {message}
              <button
                onClick={() => setMessage(null)}
                className="ml-3 text-zinc-500 hover:text-zinc-300"
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
                ? "bg-[#1a5c2a] text-white shadow-lg shadow-[#1a5c2a]/20"
                : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60"
            }`}
          >
            📊 Fase de Grupos
          </button>
          <button
            onClick={() => setActiveTab("bracket")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "bracket"
                ? "bg-[#1a5c2a] text-white shadow-lg shadow-[#1a5c2a]/20"
                : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60"
            }`}
          >
            🏆 Mata-Mata
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="px-5 py-2.5 bg-[#1a5c2a] hover:brightness-110 disabled:opacity-50 text-white font-bold text-sm rounded-lg transition-all"
          >
            {simulating ? "Simulando..." : "🎲 Simular grupos"}
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 border border-zinc-700 hover:border-red-500/50 text-zinc-400 font-bold text-sm rounded-lg transition-all"
          >
            🔄 Resetar tudo
          </button>
        </div>

        {/* ────────────── GROUPS TAB ────────────── */}
        {activeTab === "groups" && (
          <div className="space-y-8">
            {/* Instructions */}
            <div className="mx-auto max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-center">
              <p className="text-zinc-400 text-sm">
                Insira os placares dos jogos da fase de grupos. Clique em <strong className="text-zinc-200">⏳</strong> para marcar como realizado.
                Os times classificados (1º e 2º) aparecerão automaticamente no bracket.
              </p>
            </div>

            {/* Group grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {groupLetters.map((group) => {
                const matches = groupMatchesMap.get(group) ?? [];

                return (
                  <div key={group} className="space-y-3">
                    {/* Group matches — editable scores */}
                    <div className="space-y-1.5">
                      {matches.map((m) => (
                        <GroupMatchRow
                          key={m.id}
                          match={m}
                          scores={groupScores}
                          onScoreChange={handleScoreChange}
                        />
                      ))}
                    </div>

                    {/* Standings table */}
                    <GroupTable group={group} groupMatches={matches.map((m) => ({
                      ...m,
                      homeScore: groupScores[m.id]?.finished ? groupScores[m.id].homeScore : undefined,
                      awayScore: groupScores[m.id]?.finished ? groupScores[m.id].awayScore : undefined,
                      status: groupScores[m.id]?.finished ? "finished" as const : "scheduled" as const,
                    }))} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ────────────── BRACKET TAB ────────────── */}
        {activeTab === "bracket" && (
          <div className="space-y-6">
            {/* Instructions */}
            <div className="mx-auto max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-center">
              <p className="text-zinc-400 text-sm">
                Clique no time que você acha que vai vencer cada partida. Insira os placares nos campos ao lado.
                Times são automaticamente preenchidos com base nos resultados dos grupos.
              </p>
            </div>

            {/* Bracket Tree */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-6">
              <BracketTree
                resolvedMatches={resolvedMatches}
                predictions={predictions}
                onPredictionChange={handlePredictionChange}
                onScoreChange={handleScoreChange2}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
