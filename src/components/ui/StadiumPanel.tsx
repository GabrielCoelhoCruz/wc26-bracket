import type { HTMLAttributes, ReactNode } from "react"

interface StadiumPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** toolbar = neutral border; default = grass tint like PitchCard */
  variant?: "default" | "toolbar"
}

/** Panel shell aligned with WC26 stadium tokens (PitchCard family) */
export default function StadiumPanel({
  children,
  variant = "default",
  className = "",
  ...props
}: StadiumPanelProps) {
  return (
    <div
      className={`
        rounded-xl border bg-pitch-card
        shadow-[0_4px_20px_var(--shadow-color)]
        ${variant === "toolbar" ? "border-border/70" : "border-grass/25"}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
