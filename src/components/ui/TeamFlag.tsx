"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { useLanguage } from "@/components/i18n/LanguageProvider"
import type { Team } from "@/types/wc26"
import { getTeam } from "@/data/teams"
import { useCatalogVersion } from "@/components/catalog/CatalogProvider"
import { formatMessage, getTeamName } from "@/lib/i18n"

type TeamFlagSize = "xs" | "sm" | "md" | "lg"

const SIZE_MAP: Record<TeamFlagSize, { px: number; emoji: string }> = {
  xs: { px: 16, emoji: "text-sm" },
  sm: { px: 20, emoji: "text-base" },
  md: { px: 24, emoji: "text-lg" },
  lg: { px: 36, emoji: "text-2xl" },
}

interface TeamFlagProps {
  team?: Team | null
  code?: string
  size?: TeamFlagSize
  className?: string
}

export default function TeamFlag({
  team: teamProp,
  code,
  size = "sm",
  className = "",
}: TeamFlagProps) {
  const { locale, t } = useLanguage()
  const catalogVersion = useCatalogVersion()
  const team = useMemo(
    () => teamProp ?? (code ? getTeam(code) : undefined),
    [teamProp, code, catalogVersion],
  )
  const [imgError, setImgError] = useState(false)
  const { px, emoji } = SIZE_MAP[size]

  if (!team) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center ${emoji} ${className}`}
        aria-hidden
      >
        🏳️
      </span>
    )
  }

  const alt = formatMessage(t.common.flagAlt, { name: getTeamName(team, locale) })

  if (team.flagUrl && !imgError) {
    return (
      <Image
        src={team.flagUrl}
        alt={alt}
        width={px}
        height={Math.round(px * 0.67)}
        className={`shrink-0 rounded-sm object-cover shadow-sm ${className}`}
        onError={() => setImgError(true)}
        unoptimized
      />
    )
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center leading-none ${emoji} ${className}`}
      role="img"
      aria-label={alt}
    >
      {team.flag}
    </span>
  )
}
