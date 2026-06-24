"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/components/i18n/LanguageProvider"

interface DraftTimerProps {
  seconds: number
  running?: boolean
  label?: string
  onExpire?: () => void
  className?: string
  variant?: "default" | "seven"
}

function DraftTimerInner({
  seconds,
  running = true,
  label,
  onExpire,
  className = "",
  variant = "default",
}: DraftTimerProps) {
  const { t } = useLanguage()
  const displayLabel = label ?? t.common.round
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (!running || remaining <= 0) return

    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          onExpire?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(id)
  }, [running, remaining, onExpire])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const display = `${mins}:${secs.toString().padStart(2, "0")}`
  const urgent = remaining <= 10

  if (variant === "seven") {
    return (
      <div
        className={`draft-seven-timer ${urgent ? "is-urgent" : ""} ${className}`}
        role="timer"
        aria-live="polite"
        aria-label={`${displayLabel}: ${display}`}
      >
        <span className="text-[10px]">{displayLabel}</span>
        <span className="d7-num">{display}</span>
      </div>
    )
  }

  return (
    <div
      className={`
        inline-flex flex-col items-center rounded-xl border border-grass/40
        bg-tunnel-dark px-4 py-2
        ${urgent ? "border-red-500/50 animate-pulse-live" : ""}
        ${className}
      `}
      role="timer"
      aria-live="polite"
      aria-label={`${displayLabel}: ${display}`}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {displayLabel}
      </span>
      <span className={`font-scoreboard text-2xl font-black ${urgent ? "text-red-500" : "text-led"}`}>
        {display}
      </span>
    </div>
  )
}

export default function DraftTimer(props: DraftTimerProps) {
  return <DraftTimerInner key={props.seconds} {...props} />
}
