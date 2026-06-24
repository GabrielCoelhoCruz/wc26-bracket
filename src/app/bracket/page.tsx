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
      <main className="flex min-h-screen items-center justify-center">
        Carregando...
      </main>
    );
  }

  const predictions = getPredictions();
  const r32Teams = getR32Teams();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Bracket da Copa 2026</h1>
      <p className="text-zinc-400">{count} palpite(s) preenchido(s)</p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={seedDummy}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
        >
          Preencher palpites de teste
        </button>
        <button
          onClick={handleSaveToServer}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-500"
        >
          Salvar no servidor
        </button>
        <button
          onClick={handleReset}
          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-500"
        >
          Limpar
        </button>
      </div>

      {message && (
        <div className="rounded bg-zinc-800 px-4 py-2 text-sm text-zinc-200">
          {message}
        </div>
      )}

      <pre className="max-w-md overflow-auto rounded bg-zinc-900 p-4 text-xs text-zinc-300">
        {JSON.stringify({ predictions, r32Teams }, null, 2)}
      </pre>
    </main>
  );
}
