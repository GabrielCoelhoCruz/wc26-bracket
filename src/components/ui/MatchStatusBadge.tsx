"use client"

import LiveIndicator from "@/components/ui/LiveIndicator"
import { useLanguage } from "@/components/i18n/LanguageProvider"
import type { Match } from "@/types/wc26"

interface MatchStatusBadgeProps {
  fixture?: Match
  compact?: boolean
}

export default function MatchStatusBadge({ fixture, compact = false }: MatchStatusBadgeProps) {
  const { t } = useLanguage()

  if (!fixture) {
    return (
      <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">
        {t.common.predictionBadge}
      </span>
    )
  }

  if (fixture.status === "live") {
    const elapsed =
      fixture.elapsed && fixture.elapsed !== "live" ? ` · ${fixture.elapsed}` : ""
    return (
      <LiveIndicator
        label={compact ? t.common.liveShort : `${t.common.live.toUpperCase()}${elapsed}`}
        className="text-[9px]"
      />
    )
  }

  if (fixture.status === "finished") {
    return (
      <span className="rounded bg-grass/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-grass">
        {compact ? t.common.finishedShort : t.common.finishedLabel}
      </span>
    )
  }

  return (
    <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">
      {compact ? t.common.scheduledShort : t.common.scheduled}
    </span>
  )
}
