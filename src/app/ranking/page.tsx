"use client";

import { Trophy } from "lucide-react";

const skeletonRows = [
  { rank: 1, medal: "🥇", color: "text-[var(--accent)]" },
  { rank: 2, medal: "🥈", color: "text-zinc-300" },
  { rank: 3, medal: "🥉", color: "text-amber-700" },
  { rank: 4, medal: null, color: "text-zinc-500" },
  { rank: 5, medal: null, color: "text-zinc-500" },
];

export default function RankingPage() {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-12 text-center sm:py-20">
      <div className="max-w-2xl w-full">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-black text-white sm:text-4xl">
          <Trophy size={28} className="text-[var(--accent)]" />
          Ranking
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Confira a pontuação de todos os participantes
        </p>
      </div>

      {/* Skeleton leaderboard */}
      <div className="mt-10 w-full max-w-md space-y-3">
        {skeletonRows.map((row) => (
          <div
            key={row.rank}
            className="flex items-center gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-5 py-4"
          >
            <span
              className={`w-8 text-lg font-black ${row.color}`}
            >
              {row.medal ? row.medal : `#${row.rank}`}
            </span>

            <div className="flex-1 text-left">
              <div className="h-4 w-32 animate-pulse rounded bg-[var(--surface)]" />
              <div className="mt-2 h-3 w-20 animate-pulse rounded bg-[var(--surface)]" />
            </div>

            <div className="h-6 w-10 animate-pulse rounded bg-[var(--surface)]" />
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-[var(--muted)]">coming soon</p>
    </div>
  );
}
