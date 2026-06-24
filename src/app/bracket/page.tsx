// ---------------------------------------------------------------------------
// Bracket Page – Interactive WC26 Knockout Bracket
// ---------------------------------------------------------------------------
"use client";

import { useEffect, useState } from "react";
import {
  getPredictions,
  getR32Teams,
  savePrediction,
  saveR32Teams,
  resetPredictions,
  predictionCount,
  type SavedBracket,
} from "@/lib/bracket-store";

export default function BracketPage() {
  const [isClient, setIsClient] = useState(false);
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    setCount(predictionCount());
  }, []);

  const seedDummy = () => {
    savePrediction("R32-01", { winner: "BRA", homeScore: 2, awayScore: 1 });
    savePrediction("R32-02", { winner: "ARG", homeScore: 1, awayScore: 0 });
    saveR32Teams("R32-01", { homeTeam: "BRA", awayTeam: "GER" });
    setCount(predictionCount());
    setMessage("Palpites salvos no localStorage");
  };

  const handleReset = () => {
    resetPredictions();
    setCount(0);
    setMessage("Palpites limpos");
  };

  const handleSaveToServer = async () => {
    const saved = JSON.parse(
      localStorage.getItem("wc26-bracket-predictions") ?? "null",
    ) as SavedBracket | null;
    if (!saved) {
      setMessage("Nada para salvar");
      return;
    }

    try {
      const res = await fetch("/api/bracket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saved),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(`Erro ao salvar: ${json.error ?? res.statusText}`);
      } else {
        setMessage(`Salvo no servidor. Hash: ${json.hash}`);
      }
    } catch (err) {
      setMessage(`Erro de rede: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  if (!isClient) {
    return (
      <main className="flex min-h-screen items-center justify-center text-zinc-400">
        Carregando...
      </main>
    );
  }

  const predictions = getPredictions();
  const r32Teams = getR32Teams();

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-12 sm:py-20 text-center">
      <div className="max-w-4xl w-full">
        {/* Gold section label — 7a0 style */}
        <p className="text-[#fbbf24] text-sm font-bold tracking-widest mb-4 uppercase">
          Bracket
        </p>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Bracket da Copa 2026
        </h1>
        <p className="text-zinc-400 text-sm mb-2">
          {count} palpite(s) preenchido(s)
        </p>

        {/* Action buttons — 7a0 style */}
        <div className="flex flex-wrap justify-center gap-3 mt-6 mb-8">
          <button
            onClick={seedDummy}
            className="px-6 py-3 bg-[#1a5c2a] hover:brightness-110 text-white font-bold text-sm rounded-lg transition-all"
          >
            Preencher palpites de teste
          </button>
          <button
            onClick={handleSaveToServer}
            className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-bold text-sm rounded-lg transition-all"
          >
            Salvar no servidor
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 border border-zinc-700 hover:border-red-500/50 text-zinc-400 font-bold text-sm rounded-lg transition-all"
          >
            Limpar
          </button>
        </div>

        {message && (
          <div className="inline-block rounded-lg bg-zinc-800/80 px-4 py-2 text-sm text-zinc-200 mb-8">
            {message}
          </div>
        )}

        <pre className="mx-auto max-w-2xl overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs text-zinc-400 text-left">
          {JSON.stringify({ predictions, r32Teams }, null, 2)}
        </pre>
      </div>
    </main>
  );
}
