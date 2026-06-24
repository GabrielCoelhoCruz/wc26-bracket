// ---------------------------------------------------------------------------
// WC26 – Bracket Tree Component
// Visual tournament bracket showing teams advancing from R32 to Final
// ---------------------------------------------------------------------------
"use client";

import { bracketSlots } from "@/data/knockout-bracket";
import { getTeam } from "@/data/teams";
import { GROUP_PAIRS, type ResolvedBracketMatch } from "@/lib/bracket-resolver";
import type { TeamCode } from "@/types/wc26";

interface BracketTreeProps {
  resolvedMatches: ResolvedBracketMatch[];
  predictions: Record<string, { winner: TeamCode; homeScore?: number; awayScore?: number }>;
  onPredictionChange: (matchId: string, team: TeamCode) => void;
  onScoreChange: (matchId: string, side: "home" | "away", value: number) => void;
}

/** Round labels and CSS column sizing */
const ROUND_CONFIG = [
  { label: "32 Avos", round: 1, cols: "col-span-1", abbrev: "R32" },
  { label: "16 Avos", round: 2, cols: "col-span-1", abbrev: "R16" },
  { label: "Quartas", round: 3, cols: "col-span-1", abbrev: "QF" },
  { label: "Semi", round: 4, cols: "col-span-1", abbrev: "SF" },
  { label: "Final", round: 5, cols: "col-span-1", abbrev: "FIN" },
];

function TeamBadge({
  team,
  label,
  isWinner,
  showScore,
  score,
  onScoreChange,
  side,
}: {
  team: TeamCode | null;
  label?: string;
  isWinner?: boolean;
  showScore?: boolean;
  score?: number;
  onScoreChange?: (val: number) => void;
  side?: "home" | "away";
}) {
  const teamData = team ? getTeam(team) : null;

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium
        transition-all duration-150 min-w-[160px] h-9
        ${teamData
          ? isWinner
            ? "bg-[#1a5c2a]/30 border border-[#fbbf24]/50 text-white"
            : "bg-zinc-800/60 border border-zinc-700/50 text-zinc-300"
          : "bg-zinc-900/40 border border-dashed border-zinc-700/30 text-zinc-600"
        }
      `}
    >
      {teamData ? (
        <>
          <span className="text-base leading-none">{teamData.flag}</span>
          <span className="flex-1 truncate">{teamData.namePt}</span>
          <span className="text-[10px] text-zinc-500 uppercase">{team}</span>
          {showScore && (
            <input
              type="number"
              min={0}
              max={99}
              value={score ?? ""}
              onChange={(e) => onScoreChange?.(Math.min(99, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-8 h-6 rounded bg-zinc-800 border border-zinc-600 text-center text-xs text-white font-bold
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                focus:border-[#fbbf24] focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {isWinner && (
            <span className="text-[#fbbf24] text-[10px]">🏆</span>
          )}
        </>
      ) : label ? (
        <span className="text-zinc-600 italic text-[10px]">{label}</span>
      ) : (
        <span className="text-zinc-700 italic text-[10px]">A definir</span>
      )}
    </div>
  );
}

function MatchCard({
  match,
  predictions,
  onPredictionChange,
  onScoreChange,
}: {
  match: ResolvedBracketMatch;
  predictions: Record<string, { winner: TeamCode; homeScore?: number; awayScore?: number }>;
  onPredictionChange: (matchId: string, team: TeamCode) => void;
  onScoreChange: (matchId: string, side: "home" | "away", value: number) => void;
}) {
  const pred = predictions[match.matchId];
  const homeScore = pred?.homeScore;
  const awayScore = pred?.awayScore;
  const predWinner = pred?.winner;

  const isHomeWinner = match.homeTeam !== null && predWinner === match.homeTeam;
  const isAwayWinner = match.awayTeam !== null && predWinner === match.awayTeam;

  return (
    <div className="flex flex-col gap-1 py-1">
      {/* Home team (position 1 / top) */}
      <div
        className="flex items-center gap-1 cursor-pointer hover:opacity-80"
        onClick={() => match.homeTeam && onPredictionChange(match.matchId, match.homeTeam)}
      >
        <TeamBadge
          team={match.homeTeam}
          label={match.round === 1 ? getR32Label(match.matchId, "home") : undefined}
          isWinner={isHomeWinner}
          showScore
          score={homeScore}
          onScoreChange={(v) => onScoreChange(match.matchId, "home", v)}
          side="home"
        />
      </div>
      {/* Away team (position 2 / bottom) */}
      <div
        className="flex items-center gap-1 cursor-pointer hover:opacity-80"
        onClick={() => match.awayTeam && onPredictionChange(match.matchId, match.awayTeam)}
      >
        <TeamBadge
          team={match.awayTeam}
          label={match.round === 1 ? getR32Label(match.matchId, "away") : undefined}
          isWinner={isAwayWinner}
          showScore
          score={awayScore}
          onScoreChange={(v) => onScoreChange(match.matchId, "away", v)}
          side="away"
        />
      </div>
    </div>
  );
}

/** Get the R32 label for a match slot */
function getR32Label(matchId: string, side: "home" | "away"): string {
  // Map matchId back to slot indices
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
  const pair = GROUP_PAIRS[pairIdx];
  if (!pair) return "";

  const [groupOdd, groupEven] = pair;
  // 0: 1st odd, 1: 2nd even, 2: 1st even, 3: 2nd odd
  if (posInPair === 0) return `1º ${groupOdd}`;
  if (posInPair === 1) return `2º ${groupEven}`;
  if (posInPair === 2) return `1º ${groupEven}`;
  if (posInPair === 3) return `2º ${groupOdd}`;
  return "";
}

export default function BracketTree({
  resolvedMatches,
  predictions,
  onPredictionChange,
  onScoreChange,
}: BracketTreeProps) {
  // Group matches by round
  const matchesByRound = new Map<number, ResolvedBracketMatch[]>();
  for (const match of resolvedMatches) {
    const existing = matchesByRound.get(match.round) ?? [];
    existing.push(match);
    matchesByRound.set(match.round, existing);
  }

  return (
    <div className="w-full overflow-x-auto pb-6">
      <div className="flex gap-4 min-w-[900px]">
        {ROUND_CONFIG.map((roundCfg) => {
          const roundMatches = matchesByRound.get(roundCfg.round) ?? [];

          return (
            <div key={roundCfg.round} className="flex-1 min-w-[180px]">
              {/* Round header */}
              <div className="text-center mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-zinc-800/80 text-[#fbbf24] text-[10px] font-bold tracking-wider uppercase">
                  {roundCfg.label}
                </span>
                <span className="block text-[10px] text-zinc-600 mt-0.5">
                  {roundMatches.length} jogo(s)
                </span>
              </div>

              {/* Matches */}
              <div className="flex flex-col gap-2">
                {roundMatches.map((match) => (
                  <MatchCard
                    key={match.matchId}
                    match={match}
                    predictions={predictions}
                    onPredictionChange={onPredictionChange}
                    onScoreChange={onScoreChange}
                  />
                ))}
              </div>

              {/* Connector lines (visual guides between rounds) */}
              {roundCfg.round < 5 && (
                <div className="flex justify-center mt-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-zinc-700">
                    <path
                      d="M4 12h16M16 8l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}

        {/* Trophy column */}
        <div className="flex-1 min-w-[180px]">
          <div className="text-center mb-3">
            <span className="inline-block px-3 py-1 rounded-full bg-[#fbbf24]/20 text-[#fbbf24] text-[10px] font-bold tracking-wider uppercase">
              Campeão
            </span>
          </div>
          <div className="flex flex-col items-center justify-center h-full pt-8">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-sm text-zinc-500 font-medium">
              {(() => {
                const finalMatch = resolvedMatches.find((m) => m.matchId === "final");
                if (!finalMatch) return "A definir";
                const pred = predictions["final"];
                if (pred?.winner) {
                  const team = getTeam(pred.winner);
                  return team ? `${team.flag} ${team.namePt}` : pred.winner;
                }
                return "A definir";
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
