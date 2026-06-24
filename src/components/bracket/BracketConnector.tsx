"use client"

import { useCallback, useEffect, useState, type RefObject } from "react"
import { BRACKET_FEEDER_MAP } from "./bracket-feeder-map"

interface BracketConnectorProps {
  containerRef: RefObject<HTMLDivElement | null>
  cardRefs: RefObject<Map<string, HTMLDivElement>>
  className?: string
}

export default function BracketConnector({
  containerRef,
  cardRefs,
  className = "",
}: BracketConnectorProps) {
  const [paths, setPaths] = useState<string[]>([])

  const updatePaths = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const newPaths: string[] = []

    for (const [targetId, sourceIds] of Object.entries(BRACKET_FEEDER_MAP)) {
      const targetEl = cardRefs.current?.get(targetId)
      if (!targetEl) continue

      const targetRect = targetEl.getBoundingClientRect()
      const tx = targetRect.left - containerRect.left
      const ty = targetRect.top + targetRect.height / 2 - containerRect.top

      for (const sourceId of sourceIds) {
        const sourceEl = cardRefs.current?.get(sourceId)
        if (!sourceEl) continue

        const sourceRect = sourceEl.getBoundingClientRect()
        const sx = sourceRect.right - containerRect.left
        const sy = sourceRect.top + sourceRect.height / 2 - containerRect.top
        const midX = sx + (tx - sx) * 0.5

        newPaths.push(`M ${sx} ${sy} H ${midX} V ${ty} H ${tx}`)
      }
    }

    setPaths(newPaths)
  }, [containerRef, cardRefs])

  useEffect(() => {
    updatePaths()
    window.addEventListener("resize", updatePaths)
    return () => window.removeEventListener("resize", updatePaths)
  }, [updatePaths])

  if (paths.length === 0) return null

  return (
    <svg
      className={`pointer-events-none absolute inset-0 hidden md:block ${className}`}
      style={{ width: "100%", height: "100%" }}
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="var(--grass-mid)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.65}
        />
      ))}
    </svg>
  )
}
