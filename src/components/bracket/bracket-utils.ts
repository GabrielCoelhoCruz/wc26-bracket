import { bracketSlots } from "@/data/knockout-bracket"
import { GROUP_PAIRS } from "@/lib/bracket-resolver"

export const ROUND_CONFIG = [
  { label: "32 avos", round: 1, abbrev: "R32", short: "1/16" },
  { label: "Oitavas", round: 2, abbrev: "R16", short: "1/8" },
  { label: "Quartas", round: 3, abbrev: "QF", short: "1/4" },
  { label: "Semi", round: 4, abbrev: "SF", short: "1/2" },
  { label: "Final", round: 5, abbrev: "FIN", short: "Final" },
] as const

export function formatShortDate(date: string, time?: string): string {
  const d = new Date(`${date}T12:00:00`)
  const day = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
  return time ? `${day} · ${time}` : day
}

export function getR32Label(matchId: string, side: "home" | "away"): string {
  const slots = bracketSlots.filter((s) => s.matchId === matchId && s.round === 1)
  if (slots.length < 2) return ""

  const homeSlot = slots.find((s) => s.position === 1)
  const awaySlot = slots.find((s) => s.position === 2)
  const slot = side === "home" ? homeSlot : awaySlot
  if (!slot) return ""

  const idx = bracketSlots.indexOf(slot)
  if (idx === -1) return ""
  const pairIdx = Math.floor(idx / 4)
  const posInPair = idx % 4

  if (pairIdx < GROUP_PAIRS.length) {
    const pair = GROUP_PAIRS[pairIdx]
    if (!pair) return ""

    const [groupOdd, groupEven] = pair
    if (posInPair === 0) return `1º ${groupOdd}`
    if (posInPair === 1) return `2º ${groupEven}`
    if (posInPair === 2) return `1º ${groupEven}`
    if (posInPair === 3) return `2º ${groupOdd}`
  }

  return "3º melhor"
}

export function getRoundLabel(round: number): string {
  return ROUND_CONFIG.find((r) => r.round === round)?.label ?? `Fase ${round}`
}
