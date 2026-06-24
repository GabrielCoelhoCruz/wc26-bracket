"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { getTeam } from "@/data/teams"
import TeamFlag from "@/components/ui/TeamFlag"
import FlagBadge from "@/components/ui/FlagBadge"
import PitchCard from "@/components/ui/PitchCard"
import MatchStatusBadge from "@/components/ui/MatchStatusBadge"
import LiveIndicator from "@/components/ui/LiveIndicator"
import DayNavigator from "@/components/bracket/DayNavigator"
import StadiumPanel from "@/components/ui/StadiumPanel"
import {
  STADIUM_EASE,
  chipFilterActive,
  chipFilterInactive,
  chipPrimaryActive,
  chipPrimaryInactive,
} from "@/lib/stadium-ui"
import { getGroupLetters, getGroupStandings } from "@/lib/group-standings"
import {
  getMatchDays,
  getSmartDefaultDay,
  groupMatchesByTime,
  shouldDefaultToByDay,
  type DayScope,
} from "@/lib/match-day-nav"
import { useLanguage } from "@/components/i18n/LanguageProvider"
import { formatMatchDateTime, formatMessage, getTeamName } from "@/lib/i18n"
import type { Match } from "@/types/wc26"

type GroupsViewMode = "by-group" | "by-day"
type GroupMatchFilter = "all" | "live" | "upcoming" | "finished"

const EASE = STADIUM_EASE

interface GroupMatchScore {
  homeScore: number
  awayScore: number
  finished: boolean
}

function filterMatch(m: Match, filter: GroupMatchFilter): boolean {
  if (filter === "all") return true
  if (filter === "live") return m.status === "live"
  if (filter === "upcoming") return m.status === "scheduled"
  return m.status === "finished"
}

function GroupMatchCard({
  match,
  scores,
  onScoreChange,
  showTime = true,
}: {
  match: Match
  scores: Record<string, GroupMatchScore>
  onScoreChange: (
    matchId: string,
    field: "homeScore" | "awayScore" | "finished",
    value: number | boolean,
  ) => void
  showTime?: boolean
}) {
  const { locale, t } = useLanguage()
  const s = scores[match.id]
  const isApiLive = match.status === "live"
  const isApiFinished = match.status === "finished"
  const isManual = s?.finished ?? false

  const homeScore =
    isApiLive || isApiFinished
      ? (match.homeScore ?? 0)
      : isManual
        ? (s?.homeScore ?? 0)
        : 0
  const awayScore =
    isApiLive || isApiFinished
      ? (match.awayScore ?? 0)
      : isManual
        ? (s?.awayScore ?? 0)
        : 0
  const finished = isApiFinished || isManual
  const locked = isApiLive || isApiFinished

  const homeTeam = getTeam(match.homeTeam)
  const awayTeam = getTeam(match.awayTeam)

  return (
    <PitchCard live={isApiLive} className="p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-grass/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-grass">
          {t.common.group} {match.group}
        </span>
        <div className="flex items-center gap-2">
          {isApiLive ? (
            <LiveIndicator className="text-[9px]" />
          ) : (
            <MatchStatusBadge fixture={match} compact />
          )}
          {showTime && (
            <span className="text-[10px] text-muted-foreground">
              {formatMatchDateTime(match.date, locale, match.time)}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex min-w-0 items-center gap-2 justify-self-start">
          <TeamFlag team={homeTeam} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{getTeamName(homeTeam, locale) || match.homeTeam}</p>
            <p className="text-[10px] uppercase text-muted-foreground">{match.homeTeam}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 justify-self-center">
          {locked ? (
            <span className="font-scoreboard text-xl font-black tabular-nums text-led">
              {homeScore}
              <span className="mx-2 text-muted-foreground">-</span>
              {awayScore}
            </span>
          ) : (
            <>
              <input
                type="number"
                min={0}
                max={20}
                value={finished ? homeScore : ""}
                placeholder="-"
                disabled={!finished}
                onChange={(e) =>
                  onScoreChange(
                    match.id,
                    "homeScore",
                    Math.min(20, Math.max(0, parseInt(e.target.value) || 0)),
                  )
                }
                className="h-10 w-11 rounded-lg border border-grass/40 bg-tunnel-dark text-center text-sm font-bold text-led
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                  focus:border-led focus:outline-none disabled:opacity-40"
                aria-label={t.common.homeScore}
              />
              <span className="text-muted-foreground">×</span>
              <input
                type="number"
                min={0}
                max={20}
                value={finished ? awayScore : ""}
                placeholder="-"
                disabled={!finished}
                onChange={(e) =>
                  onScoreChange(
                    match.id,
                    "awayScore",
                    Math.min(20, Math.max(0, parseInt(e.target.value) || 0)),
                  )
                }
                className="h-10 w-11 rounded-lg border border-grass/40 bg-tunnel-dark text-center text-sm font-bold text-led
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                  focus:border-led focus:outline-none disabled:opacity-40"
                aria-label={t.common.awayScore}
              />
            </>
          )}
        </div>

        <div className="flex min-w-0 items-center justify-end gap-2 justify-self-end text-right">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{getTeamName(awayTeam, locale) || match.awayTeam}</p>
            <p className="text-[10px] uppercase text-muted-foreground">{match.awayTeam}</p>
          </div>
          <TeamFlag team={awayTeam} size="sm" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/40 pt-3">
        <p className="truncate text-[10px] text-muted-foreground">
          {match.stadium}
          {match.city ? ` · ${match.city}` : ""}
        </p>
        {isApiLive ? (
          <span className="text-[10px] font-bold text-red-500">
            {match.elapsed === "live" ? t.common.inProgress : match.elapsed}
          </span>
        ) : (
          <button
            onClick={() => onScoreChange(match.id, "finished", !finished)}
            disabled={isApiFinished}
            className={`rounded-full px-3 py-1 text-[10px] font-bold transition-all ${EASE} ${
              finished
                ? "bg-pitch text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            } ${isApiFinished ? "cursor-default opacity-60" : ""}`}
          >
            {finished ? t.common.finishedLabel : t.common.markFinished}
          </button>
        )}
      </div>
    </PitchCard>
  )
}

function GroupStandingsTable({
  group,
  groupMatches,
  compact = false,
}: {
  group: string
  groupMatches: Match[]
  compact?: boolean
}) {
  const { locale, t } = useLanguage()
  const standings = useMemo(
    () => getGroupStandings(group, groupMatches),
    [group, groupMatches],
  )

  const finishedCount = groupMatches.filter((m) => m.status === "finished").length
  const isComplete =
    groupMatches.length > 0 && finishedCount === groupMatches.length

  return (
    <div className={`overflow-x-auto ${compact ? "" : "rounded-xl border border-grass/20 bg-pitch-card p-4"}`}>
      {!compact && (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-accent">
            {t.common.standings} — {t.common.group} {group}
          </h3>
          <span className="text-[10px] text-muted-foreground">
            {finishedCount}/{groupMatches.length} {t.common.games}
            {isComplete && (
              <span className="ml-2 font-bold text-pitch">· {t.common.complete}</span>
            )}
          </span>
        </div>
      )}
      <table className={`w-full text-xs ${compact ? "min-w-[400px]" : "min-w-[520px]"}`}>
        <thead>
          <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
            <th className="py-2 pr-3 text-left">#</th>
            <th className="py-2 pr-3 text-left">{t.common.team}</th>
            <th className="px-2 py-2 text-center">{t.common.ptsShort}</th>
            <th className="px-2 py-2 text-center">{t.common.played}</th>
            <th className="px-2 py-2 text-center">{t.common.won}</th>
            <th className="px-2 py-2 text-center">{t.common.drawn}</th>
            <th className="px-2 py-2 text-center">{t.common.lost}</th>
            <th className="px-2 py-2 text-center">{t.common.gd}</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => {
            const team = getTeam(row.team)
            const qualified = i < 2
            return (
              <tr
                key={row.team}
                className={`border-t border-border/40 ${
                  qualified ? "row-qualified text-foreground" : "row-eliminated"
                }`}
              >
                <td className="py-2 pr-3 font-mono">{i + 1}</td>
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-2">
                    <FlagBadge code={row.team} group={group} size="sm" />
                    <span className="font-medium">{getTeamName(team, locale) || row.team}</span>
                    {qualified && (
                      <span className="rounded bg-grass/20 px-1 py-0.5 text-[8px] font-bold uppercase text-grass">
                        {i === 0 ? t.common.first : t.common.second}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-2 py-2 text-center text-sm font-bold">{row.points}</td>
                <td className="px-2 py-2 text-center">{row.played}</td>
                <td className="px-2 py-2 text-center">{row.won}</td>
                <td className="px-2 py-2 text-center">{row.drawn}</td>
                <td className="px-2 py-2 text-center">{row.lost}</td>
                <td className="px-2 py-2 text-center">{row.goalDifference}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function GroupStandingsAccordion({
  group,
  groupMatches,
  defaultOpen,
}: {
  group: string
  groupMatches: Match[]
  defaultOpen: boolean
}) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-xl border border-grass/20 bg-pitch-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors ${EASE} hover:bg-muted/30`}
        aria-expanded={open}
      >
        <span className="text-muted-foreground">
          {t.common.standings} —{" "}
          <span className="text-foreground font-bold">
            {t.common.group} {group}
          </span>
        </span>
        {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>
      {open && (
        <div className="border-t border-border/40 px-4 pb-4 pt-2">
          <GroupStandingsTable group={group} groupMatches={groupMatches} compact />
        </div>
      )}
    </div>
  )
}

function GroupsToolbar({
  viewMode,
  onViewModeChange,
  matchFilter,
  onMatchFilterChange,
}: {
  viewMode: GroupsViewMode
  onViewModeChange: (mode: GroupsViewMode) => void
  matchFilter: GroupMatchFilter
  onMatchFilterChange: (filter: GroupMatchFilter) => void
}) {
  const { t } = useLanguage()

  return (
    <StadiumPanel variant="toolbar" className="p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => onViewModeChange("by-group")}
            className={`rounded-lg px-5 py-2 text-sm font-bold ${EASE} ${
              viewMode === "by-group" ? chipPrimaryActive : chipPrimaryInactive
            }`}
          >
            {t.common.byGroup}
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("by-day")}
            className={`rounded-lg px-5 py-2 text-sm font-bold ${EASE} ${
              viewMode === "by-day" ? chipPrimaryActive : chipPrimaryInactive
            }`}
          >
            {t.common.byDay}
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {(
            [
              ["all", t.filters.all],
              ["live", t.filters.live],
              ["upcoming", t.filters.upcoming],
              ["finished", t.filters.finished],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => onMatchFilterChange(key)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold ${EASE} ${
                matchFilter === key ? chipFilterActive : chipFilterInactive
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </StadiumPanel>
  )
}

interface GroupsStageViewProps {
  groupMatchesMap: Map<string, Match[]>
  groupScores: Record<string, GroupMatchScore>
  onScoreChange: (
    matchId: string,
    field: "homeScore" | "awayScore" | "finished",
    value: number | boolean,
  ) => void
}

export default function GroupsStageView({
  groupMatchesMap,
  groupScores,
  onScoreChange,
}: GroupsStageViewProps) {
  const { t } = useLanguage()
  const groupLetters = useMemo(() => getGroupLetters(), [])

  const allGroupMatches = useMemo(() => {
    const list: Match[] = []
    for (const g of groupLetters) {
      list.push(...(groupMatchesMap.get(g) ?? []))
    }
    return list
  }, [groupLetters, groupMatchesMap])

  const matchDays = useMemo(() => getMatchDays(allGroupMatches), [allGroupMatches])

  const smartDefaultDay = useMemo(
    () => getSmartDefaultDay(allGroupMatches),
    [allGroupMatches],
  )

  const defaultViewMode: GroupsViewMode = useMemo(
    () => (shouldDefaultToByDay(allGroupMatches) ? "by-day" : "by-group"),
    [allGroupMatches],
  )

  const [viewMode, setViewMode] = useState<GroupsViewMode>(defaultViewMode)
  const [selectedGroup, setSelectedGroup] = useState(groupLetters[0] ?? "A")
  const [matchFilter, setMatchFilter] = useState<GroupMatchFilter>("all")
  const [selectedDay, setSelectedDay] = useState(smartDefaultDay)
  const [dayScope, setDayScope] = useState<DayScope>("week")

  const activeDay = matchDays.includes(selectedDay) ? selectedDay : smartDefaultDay

  const selectedGroupMatches = useMemo(() => {
    return (groupMatchesMap.get(selectedGroup) ?? []).filter((m) =>
      filterMatch(m, matchFilter),
    )
  }, [groupMatchesMap, selectedGroup, matchFilter])

  const selectedGroupAllMatches = groupMatchesMap.get(selectedGroup) ?? []

  const dayMatches = useMemo(() => {
    return allGroupMatches
      .filter((m) => m.date === activeDay)
      .filter((m) => filterMatch(m, matchFilter))
  }, [allGroupMatches, activeDay, matchFilter])

  const matchesByTime = useMemo(
    () => groupMatchesByTime(dayMatches),
    [dayMatches],
  )

  const groupsInDay = useMemo(() => {
    const set = new Set<string>()
    for (const m of dayMatches) if (m.group) set.add(m.group)
    return Array.from(set).sort()
  }, [dayMatches])

  const liveGroupsInDay = useMemo(() => {
    const set = new Set<string>()
    for (const m of dayMatches) {
      if (m.status === "live" && m.group) set.add(m.group)
    }
    return set
  }, [dayMatches])

  return (
    <div className="space-y-8 py-2">
      <p className="mx-auto max-w-2xl text-center text-sm text-muted-foreground">
        {t.bracket.groupsInfo}
      </p>

      <GroupsToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        matchFilter={matchFilter}
        onMatchFilterChange={setMatchFilter}
      />

      {viewMode === "by-group" && (
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="day-nav-fade flex gap-2 overflow-x-auto pb-2">
            {groupLetters.map((g) => {
              const gm = groupMatchesMap.get(g) ?? []
              const done = gm.filter((m) => m.status === "finished").length
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGroup(g)}
                  className={`shrink-0 rounded-lg px-5 py-2.5 text-sm font-bold ${EASE} ${
                    selectedGroup === g ? chipPrimaryActive : chipPrimaryInactive
                  }`}
                >
                  {g}
                  <span className="ml-1.5 text-[10px] opacity-70">
                    {done}/{gm.length}
                  </span>
                </button>
              )
            })}
          </div>

          <GroupStandingsTable
            group={selectedGroup}
            groupMatches={selectedGroupAllMatches}
          />

          <div className="space-y-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {formatMessage(t.bracket.groupGames, { group: selectedGroup })}
            </p>
            {selectedGroupMatches.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                {t.common.noGamesFilter}
              </p>
            ) : (
              selectedGroupMatches.map((m) => (
                <GroupMatchCard
                  key={m.id}
                  match={m}
                  scores={groupScores}
                  onScoreChange={onScoreChange}
                />
              ))
            )}
          </div>
        </div>
      )}

      {viewMode === "by-day" && (
        <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          {/* Day navigator — sticky on desktop */}
          <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-80">
            <DayNavigator
              matches={allGroupMatches}
              allDays={matchDays}
              selectedDay={activeDay}
              onDayChange={setSelectedDay}
              scope={dayScope}
              onScopeChange={setDayScope}
            />
          </aside>

          {/* Match feed */}
          <div className="min-w-0 flex-1 space-y-8">
            {dayMatches.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                {t.common.noGamesDay}
              </p>
            ) : (
              <>
                {/* Collapsed standings for groups playing today */}
                <div className="space-y-3">
                  {groupsInDay.map((group) => (
                    <GroupStandingsAccordion
                      key={group}
                      group={group}
                      groupMatches={groupMatchesMap.get(group) ?? []}
                      defaultOpen={liveGroupsInDay.has(group)}
                    />
                  ))}
                </div>

                {/* Matches grouped by kickoff time */}
                {Array.from(matchesByTime.entries()).map(([time, slotMatches]) => (
                  <section key={time} className="space-y-6">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      {t.common.match} · {time}
                    </p>
                    <div className="space-y-6">
                      {slotMatches.map((m) => (
                        <GroupMatchCard
                          key={m.id}
                          match={m}
                          scores={groupScores}
                          onScoreChange={onScoreChange}
                          showTime={false}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
