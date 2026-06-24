"use client"

import { useLanguage } from "@/components/i18n/LanguageProvider"
import { getTeam } from "@/data/teams"
import { getPositionEmoji } from "@/lib/draft"
import { formatMessage, getPositionLabel } from "@/lib/i18n"
import type { CSSProperties } from "react"
import type { Player } from "@/types/wc26"

type PositionCode = Player["position"]

interface PlayerSlotProps {
  position: string
  player?: Player | null
  selected?: boolean
  pickable?: boolean
  onClick?: () => void
  className?: string
  variant?: "default" | "seven"
  style?: CSSProperties
}

export default function PlayerSlot({
  position,
  player,
  selected = false,
  pickable = false,
  onClick,
  className = "",
  variant = "default",
  style,
}: PlayerSlotProps) {
  const { locale, t, format } = useLanguage()
  const interactive = !!onClick
  const positionCode = position as PositionCode
  const positionLabel = getPositionLabel(positionCode, locale)

  if (variant === "seven") {
    const discClass = [
      "draft-seven-disc",
      !player ? "is-empty" : "is-filled",
      pickable ? "is-pickable" : "",
      selected ? "is-active" : "",
      interactive ? "is-interactive" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ")

    const label = player
      ? formatMessage(t.common.playerSlotAria, {
          name: player.name,
          position: positionLabel,
          rating: player.rating,
        })
      : format(t.common.emptySlotAria, { position: positionLabel })

    const inner = (
      <>
        <span className="d7-disc-circle">
          {player ? player.shirtNumber ?? player.rating : position}
        </span>
        {player && (
          <span className="d7-disc-name">{player.name.split(" ").pop()}</span>
        )}
      </>
    )

    if (interactive) {
      return (
        <button
          type="button"
          onClick={onClick}
          className={discClass}
          style={style}
          aria-label={label}
        >
          {inner}
        </button>
      )
    }

    return (
      <div className={discClass} style={style} aria-label={label}>
        {inner}
      </div>
    )
  }

  const teamData = player ? getTeam(player.team) : null

  if (!player) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!interactive}
        className={`
          flex flex-col items-center rounded-lg border border-dashed border-white/20
          bg-black/20 px-1 py-2 text-center transition
          ${interactive ? "cursor-pointer hover:border-grass/50 hover:bg-grass/10" : ""}
          ${className}
        `}
        aria-label={format(t.common.emptySlotAria, { position: positionLabel })}
      >
        <span className="text-base leading-none opacity-60">{getPositionEmoji(positionCode)}</span>
        <span className="mt-0.5 text-[9px] font-bold uppercase text-muted-foreground">
          {position}
        </span>
      </button>
    )
  }

  const slotAria = formatMessage(t.common.playerSlotAria, {
    name: player.name,
    position: positionLabel,
    rating: player.rating,
  })

  const content = (
    <>
      <span className="text-lg leading-none">{getPositionEmoji(player.position)}</span>
      <span className="mt-0.5 max-w-[72px] truncate text-[10px] font-bold text-foreground">
        {player.name.split(" ").pop()}
      </span>
      <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
        {teamData && <span className="text-[8px]">{player.team}</span>}
        <span className="font-scoreboard text-led">{player.rating}</span>
      </span>
    </>
  )

  const slotClassName = `
    flex flex-col items-center rounded-lg px-1 py-1.5 text-center backdrop-blur-sm
    ${selected ? "border border-gold bg-grass/20 glow-gold" : "border border-white/10 bg-black/40"}
    ${interactive ? "cursor-pointer hover:border-grass/50" : ""}
    ${className}
  `

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={slotClassName}
        aria-label={slotAria}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={slotClassName} aria-label={slotAria}>
      {content}
    </div>
  )
}
