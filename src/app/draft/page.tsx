"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DraftPick, DraftTeam, Player } from "@/types/wc26";
import {
  buildDraftTeam,
  getDraftPositionName,
  getPositionEmoji,
  makePick,
  ROUNDS,
  simulateDraft,
  startDraft,
} from "@/lib/draft";
import { matchNarrative, simulateMatch, type SimulatedMatch } from "@/lib/draft-sim";
import { getTeam } from "@/data/teams";
import { DraftResultCard } from "@/components/draft/DraftResultCard";
import { RefreshCw, Dices, Share2, Trophy, Users } from "lucide-react";
import clsx from "clsx";

const STORAGE_KEY = "wc26-draft-state";

function serializableState(state: ReturnType<typeof startDraft>) {
  return {
    round: state.round,
    completed: state.completed,
    seed: state.seed,
    picks: state.picks.map((p) => ({
      round: p.round,
      chosen: p.chosen,
      options: p.options,
    })),
  };
}

function loadState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ReturnType<typeof serializableState>;
  } catch {
    return null;
  }
}

function saveState(state: ReturnType<typeof serializableState>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export default function DraftPage() {
  const [draft, setDraft] = useState<ReturnType<typeof startDraft> | null>(null);
  const [match, setMatch] = useState<SimulatedMatch | null>(null);
  const [showCard, setShowCard] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const saved = loadState();
    if (saved) {
      const s = startDraft(saved.seed);
      let state = s;
      // Replay saved picks so the generated team matches
      for (const pick of saved.picks) {
        if (pick.chosen) {
          state = makePick(state, pick.chosen.id);
        }
      }
      setDraft(state);
      if (state.completed) {
        const team = buildDraftTeam(state.picks);
        const cpu = simulateDraftToTeam();
        setMatch(simulateMatch(team, cpu));
      }
    } else {
      setDraft(startDraft());
    }
  }, []);

  useEffect(() => {
    if (draft) {
      saveState(serializableState(draft));
    }
  }, [draft]);

  const currentPick = draft?.picks[draft.round];
  const myTeam = useMemo(() => (draft?.completed ? buildDraftTeam(draft.picks) : null), [draft]);

  function handlePick(player: Player) {
    if (!draft || draft.completed) return;
    const next = makePick(draft, player.id);
    setDraft(next);
    if (next.completed) {
      const team = buildDraftTeam(next.picks);
      const cpu = simulateDraftToTeam();
      const sim = simulateMatch(team, cpu);
      setMatch(sim);
    }
  }

  function handleRestart() {
    const fresh = startDraft();
    setDraft(fresh);
    setMatch(null);
    setShowCard(false);
  }

  function handleSimulate() {
    const cpu1 = simulateDraftToTeam();
    const cpu2 = simulateDraftToTeam();
    setMatch(simulateMatch(cpu1, cpu2));
    setDraft(null);
    setShowCard(false);
  }

  if (!draft) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-20 text-zinc-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#fbbf24] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8 sm:py-12 text-zinc-300">
      <div className="w-full max-w-4xl">
        {/* Gold section label — 7a0 style */}
        <p className="text-[#fbbf24] text-sm font-bold tracking-widest mb-4 text-center uppercase">
          Draft
        </p>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-white sm:text-4xl">Monte Seu XI</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Draft de 11 rodadas no esquema 4-3-3. Escolha um jogador por rodada e simule contra um
            time adversário.
          </p>
        </div>

        {!draft.completed ? (
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm font-semibold text-[#fbbf24]">
                Rodada {draft.round + 1} de {ROUNDS}
              </div>
              <div className="text-xs text-zinc-500">
                {currentPick && getDraftPositionName(draft.round)}
              </div>
            </div>

            <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-[#fbbf24] transition-all"
                style={{ width: `${(draft.round / ROUNDS) * 100}%` }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {currentPick?.options.map((player) => {
                const team = getTeam(player.team);
                return (
                  <button
                    key={player.id}
                    onClick={() => handlePick(player)}
                    className="group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-left transition hover:border-[#fbbf24]/50 hover:shadow-lg"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f0f0f] text-2xl">
                      {getPositionEmoji(player.position)}
                    </span>
                    <div className="flex-1">
                      <div className="font-bold text-white group-hover:text-[#fbbf24]">
                        {player.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {team?.flag} {team?.namePt} · {player.position} · {player.rating} OVR
                      </div>
                    </div>
                    <div className="text-lg font-black text-[#fbbf24]">{player.rating}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-800/60"
              >
                <RefreshCw size={16} /> Reiniciar draft
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              {myTeam && <TeamPanel team={myTeam} label="Seu time" icon={<Users size={18} />} />}
              {match && <TeamPanel team={match.away} label="Adversário" icon={<Trophy size={18} />} />}
            </div>

            {match && (
              <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center">
                <div className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Resultado simulado
                </div>
                <div className="mt-2 flex items-center justify-center gap-4 text-4xl font-black text-white sm:text-5xl">
                  <span>{match.homeScore}</span>
                  <span className="text-[#fbbf24]">–</span>
                  <span>{match.awayScore}</span>
                </div>
                <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">{matchNarrative(match)}</p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setShowCard(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#1a5c2a] hover:brightness-110 px-5 py-2.5 text-sm font-black text-white transition"
                  >
                    <Share2 size={16} /> Ver card de compartilhamento
                  </button>
                  <button
                    onClick={handleRestart}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-semibold transition hover:bg-zinc-800/60"
                  >
                    <RefreshCw size={16} /> Novo draft
                  </button>
                  <button
                    onClick={handleSimulate}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-semibold transition hover:bg-zinc-800/60"
                  >
                    <Dices size={16} /> Simular CPU × CPU
                  </button>
                </div>
              </div>
            )}

            {showCard && match && (
              <div className="mt-8 flex flex-col items-center gap-4">
                <DraftResultCard match={match} />
                <button
                  onClick={() => setShowCard(false)}
                  className="text-sm font-semibold text-zinc-500 hover:text-zinc-300 transition"
                >
                  Fechar card
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TeamPanel({ team, label, icon }: { team: DraftTeam; label: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
          {icon} {label}
        </div>
        <div className="text-lg font-black text-[#fbbf24]">{team.rating}</div>
      </div>
      <ul className="space-y-2">
        {team.players.map((p) => {
          const teamData = getTeam(p.team);
          return (
            <li key={p.id} className="flex items-center gap-3 text-sm">
              <span className="w-6 text-center">{getPositionEmoji(p.position)}</span>
              <span className="flex-1 truncate font-medium text-white">{p.name}</span>
              <span className="text-xs text-zinc-500">
                {teamData?.flag} {teamData?.namePt}
              </span>
              <span className="w-8 text-right font-bold text-zinc-300">{p.rating}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function simulateDraftToTeam(): DraftTeam {
  const state = simulateDraft();
  return buildDraftTeam(state.picks);
}
