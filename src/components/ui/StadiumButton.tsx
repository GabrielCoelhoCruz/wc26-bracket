"use client"

import Link from "next/link"
import type { ButtonHTMLAttributes, ReactNode } from "react"

interface StadiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  href?: string
}

const variantClasses = {
  primary:
    "bg-pitch text-white border-pitch hover:border-gold hover:shadow-[0_0_14px_color-mix(in_srgb,var(--gold)_35%,transparent)]",
  secondary:
    "bg-tunnel-dark/80 text-foreground border-grass/50 hover:border-gold hover:text-gold",
  ghost:
    "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:border-border",
}

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
}

const shieldClasses = `
  relative inline-flex items-center justify-center gap-2 rounded-md border-2 font-bold
  uppercase tracking-wider transition-all duration-200
  disabled:cursor-not-allowed disabled:opacity-50
  before:pointer-events-none before:absolute before:inset-0 before:rounded-[5px]
  before:bg-[linear-gradient(135deg,color-mix(in_srgb,var(--foreground)_6%,transparent)_0%,transparent_45%,color-mix(in_srgb,var(--gold)_8%,transparent)_100%)]
  after:pointer-events-none after:absolute after:inset-[3px] after:rounded-[3px]
  after:border after:border-white/10
`

function ShieldContent({ children }: { children: ReactNode }) {
  return <span className="relative z-[1] inline-flex items-center justify-center gap-2">{children}</span>
}

export default function StadiumButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  ...props
}: StadiumButtonProps) {
  const classes = `${shieldClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        <ShieldContent>{children}</ShieldContent>
      </Link>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      <ShieldContent>{children}</ShieldContent>
    </button>
  )
}
