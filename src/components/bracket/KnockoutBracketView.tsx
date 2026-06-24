// ---------------------------------------------------------------------------
// WC26 – Knockout Bracket View
// Dual-mode bracket UI: tree view + per-phase view
// ---------------------------------------------------------------------------
"use client"

import { useState } from "react"
import { Trophy, ChevronDown, ChevronUp, Info, Check } from "lucide-react"
import BracketTree, { getR32Label } from "./BracketTree"
import { getTeam } from "@/data/teams"
import FlagBadge from "@/components/ui/FlagBadge"
import PitchCard from "@/components/ui/PitchCard"
import MatchStatusBadge from "@/components/ui/MatchStatusBadge"
import ScoreboardHeader from "@/components/ui/ScoreboardHeader"
import LiveIndicator from "@/components/ui/LiveIndicator"
import { useLanguage } from "@/components/i18n/LanguageProvider"
import {
  formatMatchDateTime,
  formatShortMatchDate,
  getMatchStageLabel,
  getTeamName,
  type Messages,
} from "@/lib/i18n"
import type { ResolvedBracketMatch } from "@/lib/bracket-resolver"
import type { Match, TeamCode } from "@/types/wc26"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface KnockoutBracketViewProps {
  resolvedMatches: ResolvedBracketMatch[]
  predictions: Record<string, { winner: TeamCode; homeScore?: number; awayScore?: number }>
  onPredictionChange?: (matchId: string, team: TeamCode) => void
  onScoreChange?: (matchId: string, side: "home" | "away", value: number) => void
  readOnly?: boolean
  scoreTotal?: number
  scoreBreakdown?: { matchId: string; points: number }[]
  knockoutFixtures?: Match[]
}

type ViewMode = "arvore" | "porFase"
type PhaseTab = "r32" | "r16" | "qf" | "sf" | "final"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PHASE_TAB_CONFIG: { id: PhaseTab; round: number; matchCount: number }[] = [
  { id: "r32", round: 1, matchCount: 16 },
  { id: "r16", round: 2, matchCount: 8 },
  { id: "qf", round: 3, matchCount: 4 },
  { id: "sf", round: 4, matchCount: 2 },
  { id: "final", round: 5, matchCount: 1 },
]

const PHASE_LABEL_KEY: Record<PhaseTab, keyof Messages["stages"]> = {
  r32: "r32",
  r16: "r16",
  qf: "qf",
  sf: "sf",
  final: "final",
}

// ---------------------------------------------------------------------------
// Score strip
// ---------------------------------------------------------------------------

function ScoreStrip({
  total,
  hits,
}: {
  total: number
  hits: number
}) {
  const { t } = useLanguage()

  return (
    <div className="flex items-center justify-center gap-3 rounded-lg border border-accent/25 bg-accent-soft px-4 py-2">
      <Trophy size={14} className="text-accent shrink-0" aria-hidden />
      <span className="text-sm font-bold text-accent">{total} {t.common.pts}</span>
      <span className="text-muted-foreground text-xs">·</span>
      <span className="text-xs text-muted-foreground">{hits} {t.common.hits}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// How-to collapsible
// ---------------------------------------------------------------------------

function HowToSection() {
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <div className="rounded-lg border border-border/60 bg-card/30 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-medium text-muted-foreground hover:text-foreground"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Info size={14} aria-hidden />
          {t.common.howItWorks}
        </span>
        {open ? <ChevronUp size={14} aria-hidden /> : <ChevronDown size={14} aria-hidden />}
      </button>
      {open && (
        <div className="border-t border-border/40 px-4 pb-3 pt-2.5 text-sm text-muted-foreground leading-relaxed">
          {t.bracket.howToBody}{" "}
          <span className="text-foreground/80 font-medium">{t.bracket.howToScoring}</span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Upcoming strip
// ---------------------------------------------------------------------------

function UpcomingStrip({ matches }: { matches: Match[] }) {
  const { locale, t } = useLanguage()
  const upcoming = matches
    .filter((m) => m.status === "scheduled" || m.status === "live")
    .sort((a, b) => {
      const da = `${a.date}T${a.time ?? "00:00"}`
      const db = `${b.date}T${b.time ?? "00:00"}`
      return da.localeCompare(db)
    })
    .slice(0, 8)

  if (upcoming.length === 0) return null

  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {t.common.upcomingGames}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {upcoming.map((m) => {
          const isLive = m.status === "live"
          return (
            <PitchCard key={m.id} live={isLive} className="shrink-0 min-w-[160px] max-w-[180px] p-2 text-xs">
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[9px] font-bold uppercase text-accent">
                  {getMatchStageLabel(m.stage, locale)}
                </span>
                {isLive && <LiveIndicator className="text-[8px]" label={t.common.liveShort} />}
              </div>
              {isLive ? (
                <ScoreboardHeader
                  homeTeam={m.homeTeam}
                  awayTeam={m.awayTeam}
                  homeScore={m.homeScore ?? 0}
                  awayScore={m.awayScore ?? 0}
                  compact
                  showFullNames={false}
                />
              ) : (
                <div className="flex items-center justify-between gap-1">
                  <FlagBadge code={m.homeTeam} size="sm" />
                  <span className="shrink-0 text-[11px] font-bold text-muted-foreground px-1">{t.common.vs}</span>
                  <FlagBadge code={m.awayTeam} size="sm" />
                </div>
              )}
              {!isLive && (
                <p className="mt-1 text-[9px] text-muted-foreground truncate">
                  {formatShortMatchDate(m.date, locale, m.time)}
                </p>
              )}
            </PitchCard>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// View toggle
// ---------------------------------------------------------------------------

function ViewToggle({
  mode,
  onChange,
}: {
  mode: ViewMode
  onChange: (m: ViewMode) => void
}) {
  const { t } = useLanguage()

  return (
    <div
      className="inline-flex rounded-lg border border-border/60 bg-muted/40 p-0.5"
      role="tablist"
      aria-label={t.common.viewMode}
    >
      <button
        role="tab"
        aria-selected={mode === "arvore"}
        onClick={() => onChange("arvore")}
        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
          mode === "arvore"
            ? "bg-card shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {t.common.tree}
      </button>
      <button
        role="tab"
        aria-selected={mode === "porFase"}
        onClick={() => onChange("porFase")}
        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
          mode === "porFase"
            ? "bg-card shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {t.common.byPhase}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Phase match card (larger, collapsible details)
// ---------------------------------------------------------------------------

function PhaseTeamRow({
  team,
  label,
  isWinner,
  interactive,
  onSelect,
}: {
  team: TeamCode | null
  label?: string
  isWinner?: boolean
  interactive?: boolean
  onSelect?: () => void
}) {
  const { locale, t } = useLanguage()
  const teamData = team && team !== "TBD" ? getTeam(team) : null

  return (
    <div
      role={interactive && teamData ? "button" : undefined}
      tabIndex={interactive && teamData ? 0 : undefined}
      onClick={interactive && teamData ? onSelect : undefined}
      onKeyDown={
        interactive && teamData
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelect?.()
              }
            }
          : undefined
      }
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
        teamData
          ? isWinner
            ? "bg-pitch/15 border border-accent/30 border-l-[3px] border-l-accent text-foreground font-semibold"
            : "bg-muted/40 border border-border text-foreground/90"
          : "bg-card/40 border border-dashed border-border text-muted-foreground"
      } ${interactive && teamData ? "cursor-pointer hover:opacity-80 active:scale-[0.99]" : ""}`}
    >
      {teamData ? (
        <>
          <FlagBadge code={teamData.code as TeamCode} size="sm" className="border-0 bg-transparent px-0 py-0" />
          <span className="flex-1 truncate">{getTeamName(teamData, locale)}</span>
          {isWinner && <Check size={12} className="text-gold shrink-0" aria-label={t.common.winner} />}
        </>
      ) : label ? (
        <span className="text-xs italic text-muted-foreground">{label}</span>
      ) : (
        <span className="text-xs italic text-muted-foreground/70">{t.common.tbd}</span>
      )}
    </div>
  )
}

function PhaseMatchCard({
  match,
  predictions,
  onPredictionChange,
  onScoreChange,
  readOnly,
}: {
  match: ResolvedBracketMatch
  predictions: Record<string, { winner: TeamCode; homeScore?: number; awayScore?: number }>
  onPredictionChange?: (matchId: string, team: TeamCode) => void
  onScoreChange?: (matchId: string, side: "home" | "away", value: number) => void
  readOnly?: boolean
}) {
  const [showDetails, setShowDetails] = useState(false)
  const { locale, t } = useLanguage()
  const pred = predictions[match.matchId]
  const fixture = match.fixture
  const interactive = !readOnly && !!onPredictionChange

  const isHomeWinner = match.homeTeam !== null && pred?.winner === match.homeTeam
  const isAwayWinner = match.awayTeam !== null && pred?.winner === match.awayTeam

  const hasRealScore =
    fixture &&
    (fixture.status === "live" || fixture.status === "finished") &&
    fixture.homeScore !== undefined &&
    fixture.awayScore !== undefined

  const homeLabel = match.round === 1 ? getR32Label(match.matchId, "home", locale) : fixture?.homeTeamLabel
  const awayLabel = match.round === 1 ? getR32Label(match.matchId, "away", locale) : fixture?.awayTeamLabel

  const isLive = fixture?.status === "live"

  const hasDetails =
    fixture?.stadium ||
    hasRealScore ||
    (fixture?.homeScorers && fixture.homeScorers.length > 0) ||
    (fixture?.awayScorers && fixture.awayScorers.length > 0)

  return (
    <PitchCard live={isLive} glow={isHomeWinner || isAwayWinner} className="overflow-hidden p-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 bg-card/20 px-3 py-2">
        <MatchStatusBadge fixture={fixture} />
        {fixture && !hasRealScore && (
          <span className="text-[11px] text-muted-foreground">
            {formatMatchDateTime(fixture.date, locale, fixture.time)}
          </span>
        )}
      </div>

      {hasRealScore && match.homeTeam && match.awayTeam && (
        <div className="border-b border-border/30 p-3">
          <ScoreboardHeader
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            homeScore={fixture!.homeScore!}
            awayScore={fixture!.awayScore!}
            compact
          />
        </div>
      )}

      {/* Teams */}
      <div className="flex flex-col gap-1.5 p-3">
        <PhaseTeamRow
          team={match.homeTeam}
          label={homeLabel}
          isWinner={isHomeWinner}
          interactive={interactive}
          onSelect={() => match.homeTeam && onPredictionChange?.(match.matchId, match.homeTeam)}
        />
        <PhaseTeamRow
          team={match.awayTeam}
          label={awayLabel}
          isWinner={isAwayWinner}
          interactive={interactive}
          onSelect={() => match.awayTeam && onPredictionChange?.(match.matchId, match.awayTeam)}
        />
      </div>

      {/* Score inputs */}
      {interactive && (
        <div className="flex items-center gap-2 px-3 pb-3">
          <span className="text-xs text-muted-foreground shrink-0">{t.common.predictionLabel}:</span>
          <div className="flex items-center gap-1.5">
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
              className="h-6 w-8 rounded border border-border bg-input text-center text-xs font-bold
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                focus:border-accent focus:outline-none"
              aria-label={t.common.predictedHome}
            />
            <span className="text-xs text-muted-foreground">×</span>
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
              className="h-6 w-8 rounded border border-border bg-input text-center text-xs font-bold
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                focus:border-accent focus:outline-none"
              aria-label={t.common.predictedAway}
            />
          </div>
        </div>
      )}

      {/* Collapsible details */}
      {hasDetails && (
        <>
          <button
            onClick={() => setShowDetails((v) => !v)}
            className="flex w-full items-center gap-1.5 border-t border-border/30 px-3 py-1.5 text-left text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            aria-expanded={showDetails}
          >
            {showDetails ? <ChevronUp size={11} aria-hidden /> : <ChevronDown size={11} aria-hidden />}
            {t.common.details}
          </button>
          {showDetails && (
            <div className="border-t border-border/20 px-3 pb-3 pt-2 space-y-1">
              {fixture?.stadium && (
                <p className="text-[11px] text-muted-foreground">
                  📍 {fixture.stadium}
                  {fixture.city ? ` · ${fixture.city}` : ""}
                </p>
              )}
              {hasRealScore && (
                <p className="text-[11px] text-muted-foreground">
                  {t.common.result}: <span className="font-bold text-foreground">{fixture!.homeScore} × {fixture!.awayScore}</span>
                </p>
              )}
              {fixture?.homeScorers && fixture.homeScorers.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  ⚽ {fixture.homeScorers.join(", ")}
                </p>
              )}
              {fixture?.awayScorers && fixture.awayScorers.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  ⚽ {fixture.awayScorers.join(", ")}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </PitchCard>
  )
}

function PhaseView({
  resolvedMatches,
  predictions,
  onPredictionChange,
  onScoreChange,
  readOnly,
}: {
  resolvedMatches: ResolvedBracketMatch[]
  predictions: Record<string, { winner: TeamCode; homeScore?: number; awayScore?: number }>
  onPredictionChange?: (matchId: string, team: TeamCode) => void
  onScoreChange?: (matchId: string, side: "home" | "away", value: number) => void
  readOnly?: boolean
}) {
  const [activePhase, setActivePhase] = useState<PhaseTab>("r32")
  const { t } = useLanguage()

  const currentTab = PHASE_TAB_CONFIG.find((tab) => tab.id === activePhase)
  const phaseMatches = resolvedMatches.filter((m) => m.round === (currentTab?.round ?? 1))

  return (
    <div className="space-y-4">
      {/* Phase tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label={t.common.knockoutPhases}>
        {PHASE_TAB_CONFIG.map((tab) => {
          const isActive = activePhase === tab.id
          const tabMatches = resolvedMatches.filter((m) => m.round === tab.round)
          const hasContent = tabMatches.some((m) => m.homeTeam || m.awayTeam)
          const label = t.stages[PHASE_LABEL_KEY[tab.id]]
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActivePhase(tab.id)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-pitch text-white shadow-sm shadow-pitch/20"
                  : hasContent
                  ? "bg-muted/60 text-foreground/80 hover:bg-muted"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Match grid */}
      {phaseMatches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 py-10 text-center text-sm text-muted-foreground">
          {t.common.noMatchesPhase}
        </div>
      ) : (
        <div
          className={
            activePhase === "r32"
              ? "grid gap-3 md:grid-cols-2"
              : activePhase === "r16"
              ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-2 max-w-3xl mx-auto"
              : "grid gap-3 max-w-xl mx-auto"
          }
        >
          {phaseMatches.map((match) => (
            <PhaseMatchCard
              key={match.matchId}
              match={match}
              predictions={predictions}
              onPredictionChange={onPredictionChange}
              onScoreChange={onScoreChange}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function KnockoutBracketView({
  resolvedMatches,
  predictions,
  onPredictionChange,
  onScoreChange,
  readOnly = false,
  scoreTotal = 0,
  scoreBreakdown = [],
  knockoutFixtures = [],
}: KnockoutBracketViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("porFase")
  const { t } = useLanguage()

  const hits = scoreBreakdown.filter((b) => b.points > 0).length

  return (
    <div className="space-y-4">
      {/* Score strip */}
      {scoreTotal > 0 && <ScoreStrip total={scoreTotal} hits={hits} />}

      {/* How-to */}
      <HowToSection />

      {/* Upcoming strip */}
      {knockoutFixtures.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card/30 p-4">
          <UpcomingStrip matches={knockoutFixtures} />
        </div>
      )}

      {/* View toggle + content panel */}
      <div className="rounded-xl border border-border bg-card/30 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-sm font-bold text-foreground">{t.common.bracket}</h2>
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>

        {viewMode === "arvore" ? (
          <BracketTree
            resolvedMatches={resolvedMatches}
            predictions={predictions}
            onPredictionChange={onPredictionChange}
            onScoreChange={onScoreChange}
            readOnly={readOnly}
          />
        ) : (
          <PhaseView
            resolvedMatches={resolvedMatches}
            predictions={predictions}
            onPredictionChange={onPredictionChange}
            onScoreChange={onScoreChange}
            readOnly={readOnly}
          />
        )}
      </div>
    </div>
  )
}
