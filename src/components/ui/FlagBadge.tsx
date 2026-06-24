"use client"

import TeamFlag from "@/components/ui/TeamFlag"
import { getTeam } from "@/data/teams"
import type { TeamCode } from "@/types/wc26"

interface FlagBadgeProps {
  code: TeamCode
  group?: string
  size?: "sm" | "md"
  className?: string
}

export default function FlagBadge({
  code,
  group,
  size = "sm",
  className = "",
}: FlagBadgeProps) {
  const team = getTeam(code)
  if (!team) return null

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60
        ${size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"}
        ${className}
      `}
    >
      <TeamFlag team={team} size={size === "sm" ? "xs" : "sm"} />
      <span className="font-bold text-foreground">{code}</span>
      {group && (
        <span className="rounded bg-grass/20 px-1 py-0.5 text-[9px] font-bold uppercase text-grass">
          {group}
        </span>
      )}
    </span>
  )
}
