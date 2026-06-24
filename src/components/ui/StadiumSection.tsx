"use client"

import type { HTMLAttributes, ReactNode } from "react"

interface StadiumSectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  title?: string
  subtitle?: string
  accent?: string
}

export default function StadiumSection({
  children,
  title,
  subtitle,
  accent,
  className = "",
  ...props
}: StadiumSectionProps) {
  return (
    <section
      className={`stadium-section-lines px-4 py-8 sm:px-6 ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <header className="mb-6 text-center">
          {accent && (
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {accent}
            </p>
          )}
          {title && (
            <h2 className="font-scoreboard text-2xl font-black uppercase tracking-wider text-foreground sm:text-3xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </header>
      )}
      {children}
    </section>
  )
}
