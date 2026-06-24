"use client"

import { useEffect, useRef } from "react"
import { fetchMergedResults } from "@/lib/match-results"
import type { Match } from "@/types/wc26"

const POLL_INTERVAL_MS = 30_000

interface UseLiveMatchPollingOptions {
  enabled?: boolean
  onUpdate: (matches: Match[], source: "api" | "static") => void
}

/**
 * Polls /api/matches every 30s while any match is live.
 * Pauses when tab is hidden to save requests.
 */
export function useLiveMatchPolling({
  enabled = true,
  onUpdate,
}: UseLiveMatchPollingOptions) {
  const onUpdateRef = useRef(onUpdate)

  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    let timer: ReturnType<typeof setInterval> | null = null

    const refresh = async () => {
      if (document.hidden) return
      const { matches, source } = await fetchMergedResults()
      if (cancelled) return
      onUpdateRef.current(matches, source)

      const hasLive = matches.some((m) => m.status === "live")
      if (!hasLive && timer) {
        clearInterval(timer)
        timer = null
      } else if (hasLive && !timer) {
        timer = setInterval(() => void refresh(), POLL_INTERVAL_MS)
      }
    }

    const handleVisibility = () => {
      if (!document.hidden) void refresh()
    }

    void refresh().then(() => {
      if (cancelled) return
      timer = setInterval(() => void refresh(), POLL_INTERVAL_MS)
    })

    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      cancelled = true
      if (timer) clearInterval(timer)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [enabled])
}

export function countLiveMatches(matches: readonly Match[]): number {
  return matches.filter((m) => m.status === "live").length
}
