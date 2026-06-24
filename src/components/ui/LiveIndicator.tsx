"use client"

import { useLanguage } from "@/components/i18n/LanguageProvider"

interface LiveIndicatorProps {
  label?: string
  className?: string
}

export default function LiveIndicator({
  label,
  className = "",
}: LiveIndicatorProps) {
  const { t } = useLanguage()
  const text = label ?? t.common.live.toUpperCase()

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2 py-0.5
        text-[10px] font-bold uppercase tracking-wider text-white
        animate-pulse-live
        ${className}
      `}
      role="status"
      aria-live="polite"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
      {text}
    </span>
  )
}
