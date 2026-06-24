/** Shared motion + chip styles for bracket / groups UI */

export const STADIUM_EASE =
  "duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] transition-all"

/** Primary nav: Por grupo, Por dia, dia selecionado, escopo */
export const chipPrimaryActive =
  "bg-pitch text-white shadow-md shadow-pitch/20"

export const chipPrimaryInactive =
  "bg-muted/60 text-muted-foreground hover:bg-muted"

/** Secondary filters: Todos, Ao vivo, Próximos */
export const chipFilterActive =
  "border border-accent/40 bg-accent-soft text-accent font-bold"

export const chipFilterInactive =
  "border border-transparent bg-muted/60 text-muted-foreground hover:bg-muted hover:border-border/60"

export const chipDayActive = chipPrimaryActive

export const chipDayInactive = chipPrimaryInactive

export const chipTodayHighlight =
  "border border-grass/40 bg-pitch-card text-pitch hover:bg-pitch/10"
