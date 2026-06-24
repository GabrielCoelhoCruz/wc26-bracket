"use client"

import { useLanguage } from "@/components/i18n/LanguageProvider"
import TeamFlag from "@/components/ui/TeamFlag"
import { getTeam } from "@/data/teams"
import { getPositionEmoji } from "@/lib/draft"
import { getPositionLabel, getTeamName } from "@/lib/i18n"
import type { Player } from "@/types/wc26"

interface PlayerCardProps {
  player: Player
  hideRating?: boolean
  onClick?: () => void
  selected?: boolean
  disabled?: boolean
  variant?: "default" | "compact"
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export default function PlayerCard({
  player,
  hideRating = false,
  onClick,
  selected = false,
  disabled = false,
  variant = "default",
  className = "",
}: PlayerCardProps) {
  const { locale } = useLanguage()
  const teamData = getTeam(player.team)
  const Wrapper = onClick && !disabled ? "button" : "div"

  if (variant === "compact") {
    return (
      <Wrapper
        type={onClick && !disabled ? "button" : undefined}
        onClick={disabled ? undefined : onClick}
        className={`
          flex w-full items-center gap-3 px-4 py-2 text-left transition
          ${disabled ? "cursor-not-allowed opacity-40" : onClick ? "cursor-pointer hover:bg-muted/40" : ""}
          ${selected ? "bg-gold/10" : ""}
          ${className}
        `}
      >
        <span className="w-6 shrink-0 text-center font-scoreboard text-xs text-muted-foreground">
          {player.shirtNumber ?? "–"}
        </span>
        <span className="w-8 shrink-0 text-center text-xs font-bold text-grass">
          {getPositionLabel(player.position, locale)}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{player.name}</span>
        {player.club && (
          <span className="hidden max-w-[8rem] truncate text-[10px] text-muted-foreground sm:inline">
            {player.club}
          </span>
        )}
        {!hideRating && (
          <span className="w-8 shrink-0 text-right font-scoreboard text-sm font-black text-led">
            {player.rating}
          </span>
        )}
      </Wrapper>
    )
  }

  return (
    <Wrapper
      type={onClick && !disabled ? "button" : undefined}
      onClick={disabled ? undefined : onClick}
      className={`
        group flex w-full items-center gap-4 rounded-xl border bg-card/60 p-4 text-left transition
        ${selected ? "border-gold glow-gold" : "border-border"}
        ${disabled ? "cursor-not-allowed opacity-40" : onClick ? "cursor-pointer hover:border-grass/50 hover:shadow-lg" : ""}
        ${className}
      `}
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-grass/30 to-tunnel-dark text-sm font-bold text-foreground"
        aria-hidden
      >
        {getInitials(player.name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getPositionEmoji(player.position)}</span>
          <span className="truncate font-bold text-foreground">{player.name}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          {teamData && <TeamFlag team={teamData} size="xs" />}
          <span>{teamData ? getTeamName(teamData, locale) : player.team}</span>
          <span>·</span>
          <span>{getPositionLabel(player.position, locale)}</span>
        </div>
      </div>
      {!hideRating && (
        <span className="font-scoreboard text-xl font-black text-led">{player.rating}</span>
      )}
    </Wrapper>
  )
}
