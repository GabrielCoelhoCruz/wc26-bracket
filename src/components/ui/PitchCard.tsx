"use client"

import type { HTMLAttributes, ReactNode } from "react"

interface PitchCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  glow?: boolean
  live?: boolean
}

export default function PitchCard({
  children,
  glow = false,
  live = false,
  className = "",
  ...props
}: PitchCardProps) {
  return (
    <div
      className={`
        rounded-xl border bg-pitch-card p-3
        ${live ? "border-red-500/40" : "border-grass/30"}
        ${glow ? "glow-gold" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
