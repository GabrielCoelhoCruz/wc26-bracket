#!/usr/bin/env node
/**
 * Sync static seed data from worldcup26.ir API
 * Source: https://github.com/rezarahiminia/worldcup2026
 *
 * Usage: node scripts/sync-worldcup-data.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const DATA_DIR = join(ROOT, "src", "data")
const BASE_URL = process.env.WORLDCUP_API_URL ?? "https://worldcup26.ir"

const TEAM_META = {
  MEX: { namePt: "México", flag: "🇲🇽", rating: 79 },
  RSA: { namePt: "África do Sul", flag: "🇿🇦", rating: 72 },
  KOR: { namePt: "Coreia do Sul", flag: "🇰🇷", rating: 78 },
  CZE: { namePt: "República Tcheca", flag: "🇨🇿", rating: 76 },
  CAN: { namePt: "Canadá", flag: "🇨🇦", rating: 76 },
  BIH: { namePt: "Bósnia e Herzegovina", flag: "🇧🇦", rating: 72 },
  QAT: { namePt: "Catar", flag: "🇶🇦", rating: 68 },
  SUI: { namePt: "Suíça", flag: "🇨🇭", rating: 80 },
  BRA: { namePt: "Brasil", flag: "🇧🇷", rating: 93 },
  MAR: { namePt: "Marrocos", flag: "🇲🇦", rating: 82 },
  HAI: { namePt: "Haiti", flag: "🇭🇹", rating: 65 },
  SCO: { namePt: "Escócia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", rating: 77 },
  USA: { namePt: "Estados Unidos", flag: "🇺🇸", rating: 80 },
  PAR: { namePt: "Paraguai", flag: "🇵🇾", rating: 74 },
  AUS: { namePt: "Austrália", flag: "🇦🇺", rating: 75 },
  TUR: { namePt: "Turquia", flag: "🇹🇷", rating: 78 },
  GER: { namePt: "Alemanha", flag: "🇩🇪", rating: 88 },
  CUW: { namePt: "Curaçao", flag: "🇨🇼", rating: 68 },
  CIV: { namePt: "Costa do Marfim", flag: "🇨🇮", rating: 77 },
  ECU: { namePt: "Equador", flag: "🇪🇨", rating: 76 },
  NED: { namePt: "Países Baixos", flag: "🇳🇱", rating: 86 },
  JPN: { namePt: "Japão", flag: "🇯🇵", rating: 82 },
  SWE: { namePt: "Suécia", flag: "🇸🇪", rating: 79 },
  TUN: { namePt: "Tunísia", flag: "🇹🇳", rating: 73 },
  BEL: { namePt: "Bélgica", flag: "🇧🇪", rating: 84 },
  EGY: { namePt: "Egito", flag: "🇪🇬", rating: 74 },
  IRN: { namePt: "Irã", flag: "🇮🇷", rating: 75 },
  NZL: { namePt: "Nova Zelândia", flag: "🇳🇿", rating: 68 },
  ESP: { namePt: "Espanha", flag: "🇪🇸", rating: 89 },
  CPV: { namePt: "Cabo Verde", flag: "🇨🇻", rating: 70 },
  KSA: { namePt: "Arábia Saudita", flag: "🇸🇦", rating: 74 },
  URU: { namePt: "Uruguai", flag: "🇺🇾", rating: 83 },
  FRA: { namePt: "França", flag: "🇫🇷", rating: 91 },
  SEN: { namePt: "Senegal", flag: "🇸🇳", rating: 78 },
  IRQ: { namePt: "Iraque", flag: "🇮🇶", rating: 72 },
  NOR: { namePt: "Noruega", flag: "🇳🇴", rating: 80 },
  ARG: { namePt: "Argentina", flag: "🇦🇷", rating: 94 },
  ALG: { namePt: "Argélia", flag: "🇩🇿", rating: 76 },
  AUT: { namePt: "Áustria", flag: "🇦🇹", rating: 79 },
  JOR: { namePt: "Jordânia", flag: "🇯🇴", rating: 72 },
  POR: { namePt: "Portugal", flag: "🇵🇹", rating: 87 },
  COD: { namePt: "RD Congo", flag: "🇨🇩", rating: 73 },
  UZB: { namePt: "Uzbequistão", flag: "🇺🇿", rating: 71 },
  COL: { namePt: "Colômbia", flag: "🇨🇴", rating: 81 },
  ENG: { namePt: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", rating: 90 },
  CRO: { namePt: "Croácia", flag: "🇭🇷", rating: 82 },
  GHA: { namePt: "Gana", flag: "🇬🇭", rating: 74 },
  PAN: { namePt: "Panamá", flag: "🇵🇦", rating: 70 },
}

function getMeta(code) {
  return TEAM_META[code] ?? { namePt: code, flag: "🏳️", rating: 70 }
}

async function fetchJson(path) {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return res.json()
}

function parseLocalDate(localDate) {
  const [datePart, timePart] = localDate.split(" ")
  const [mm, dd, yyyy] = datePart.split("/")
  return {
    date: `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`,
    time: timePart ?? "00:00",
  }
}

function mapGameType(type) {
  const map = {
    group: "group",
    r32: "round_of_32",
    r16: "round_of_16",
    qf: "quarter_final",
    sf: "semi_final",
    third: "third_place",
    final: "final",
  }
  return map[type.toLowerCase()] ?? "group"
}

function esc(s) {
  if (!s) return ""
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

function parseScorers(raw) {
  if (!raw || raw === "null" || String(raw).trim() === "") return null
  const trimmed = String(raw).trim()
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    const matches = trimmed.match(/"([^"]+)"/g)
    if (matches?.length) {
      return matches.map((m) => m.replace(/^"|"$/g, ""))
    }
  }
  return [trimmed]
}

function resolveStatus(game) {
  const finished = game.finished?.toUpperCase() === "TRUE"
  if (finished) return "finished"
  const elapsed = (game.time_elapsed ?? "").trim().toLowerCase()
  if (elapsed === "live" || elapsed === "ht" || /^\d+/.test(elapsed)) return "live"
  return "scheduled"
}

function scorersToTs(arr) {
  if (!arr?.length) return ""
  const items = arr.map((s) => `"${esc(s)}"`).join(", ")
  return `homeScorers: [${items}], `
}

function awayScorersToTs(arr) {
  if (!arr?.length) return ""
  const items = arr.map((s) => `"${esc(s)}"`).join(", ")
  return `awayScorers: [${items}], `
}

async function main() {
  console.log(`Fetching from ${BASE_URL}...`)

  const [{ teams }, { games }, { stadiums }] = await Promise.all([
    fetchJson("/get/teams"),
    fetchJson("/get/games"),
    fetchJson("/get/stadiums"),
  ])

  console.log(`  ${teams.length} teams, ${games.length} games, ${stadiums.length} stadiums`)

  mkdirSync(DATA_DIR, { recursive: true })

  // ── teams.ts ──
  const sortedTeams = [...teams].sort(
    (a, b) => a.groups.localeCompare(b.groups) || a.name_en.localeCompare(b.name_en),
  )

  const teamsLines = sortedTeams.map((t) => {
    const code = t.fifa_code.toUpperCase()
    const meta = getMeta(code)
    const nameFa = t.name_fa ? `nameFa: "${esc(t.name_fa)}", ` : ""
    const flagUrl = t.flag ? `flagUrl: "${esc(t.flag)}", ` : ""
    const iso2 = t.iso2 ? `iso2: "${esc(t.iso2)}", ` : ""
    const apiId = t.id ? `apiId: "${t.id}", ` : ""
    return `  { code: "${code}", name: "${esc(t.name_en)}", namePt: "${esc(meta.namePt)}", ${nameFa}flag: "${meta.flag}", ${flagUrl}${iso2}${apiId}group: "${t.groups}", rating: ${meta.rating} },`
  })

  const teamsTs = `import type { Team } from "@/types/wc26";

/**
 * 48 teams — FIFA World Cup 2026 (Groups A–L)
 * Synced from https://worldcup26.ir — ${new Date().toISOString().slice(0, 10)}
 */
export const teams: readonly Team[] = [
${teamsLines.join("\n")}
];

/** Quick lookup helper: get a team by 3-letter code */
export function getTeam(code: string): Team | undefined {
  return teams.find((t) => t.code === code);
}

/** All teams grouped by their group letter */
export function groups(): Map<string, Team[]> {
  const map = new Map<string, Team[]>();
  for (const t of teams) {
    const g = map.get(t.group) ?? [];
    g.push(t);
    map.set(t.group, g);
  }
  return map;
}
`
  writeFileSync(join(DATA_DIR, "teams.ts"), teamsTs)
  console.log("  wrote src/data/teams.ts")

  // ── stadiums.ts ──
  const stadiumLines = stadiums.map(
    (s) =>
      `  { id: "${s.id}", name: "${esc(s.name_en)}", fifaName: "${esc(s.fifa_name)}", city: "${esc(s.city_en)}", country: "${esc(s.country_en)}", capacity: ${s.capacity}, region: "${s.region}" },`,
  )

  const stadiumsTs = `import type { Stadium } from "@/types/wc26";

/**
 * 16 host stadiums — FIFA World Cup 2026
 * Synced from https://worldcup26.ir — ${new Date().toISOString().slice(0, 10)}
 */
export const stadiums: readonly Stadium[] = [
${stadiumLines.join("\n")}
];

export function getStadium(id: string): Stadium | undefined {
  return stadiums.find((s) => s.id === id);
}
`
  writeFileSync(join(DATA_DIR, "stadiums.ts"), stadiumsTs)
  console.log("  wrote src/data/stadiums.ts")

  // ── matches.ts ──
  const teamById = new Map(teams.map((t) => [t.id, t]))
  const stadiumById = new Map(stadiums.map((s) => [s.id, s]))

  const matchLines = []
  let currentStage = ""

  for (const game of games) {
    const stage = mapGameType(game.type)
    if (stage !== currentStage) {
      currentStage = stage
      const label = {
        group: "GROUP STAGE — 72 matches",
        round_of_32: "ROUND OF 32 — 16 matches",
        round_of_16: "ROUND OF 16 — 8 matches",
        quarter_final: "QUARTER-FINALS — 4 matches",
        semi_final: "SEMI-FINALS — 2 matches",
        third_place: "THIRD PLACE",
        final: "FINAL",
      }[stage]
      matchLines.push("", `  // ── ${label} ──`)
    }

    const home = teamById.get(game.home_team_id)
    const away = teamById.get(game.away_team_id)
    const stadium = stadiumById.get(game.stadium_id)
    const status = resolveStatus(game)
    const { date, time } = parseLocalDate(game.local_date)

    let homeCode = home?.fifa_code?.toUpperCase() ?? null
    let awayCode = away?.fifa_code?.toUpperCase() ?? null
    if (game.home_team_id === "0") homeCode = "TBD"
    if (game.away_team_id === "0") awayCode = "TBD"
    if (!homeCode || !awayCode) continue

    const homeScore = parseInt(game.home_score, 10)
    const awayScore = parseInt(game.away_score, 10)
    const homeScorers = parseScorers(game.home_scorers)
    const awayScorers = parseScorers(game.away_scorers)

    const groupPart = stage === "group" ? `group: "${game.group}", ` : ""
    const timePart = `time: "${time}", `
    const persianPart = game.persian_date ? `persianDate: "${esc(game.persian_date)}", ` : ""
    const stadiumPart = stadium
      ? `stadium: "${esc(stadium.name_en)}", stadiumId: "${game.stadium_id}", city: "${esc(stadium.city_en)}", `
      : game.stadium_id
        ? `stadiumId: "${game.stadium_id}", `
        : ""
    const scorePart =
      (status === "finished" || status === "live") &&
      !Number.isNaN(homeScore) &&
      !Number.isNaN(awayScore)
        ? `homeScore: ${homeScore}, awayScore: ${awayScore}, `
        : ""
    const elapsedPart =
      status === "live"
        ? `elapsed: "${esc(game.time_elapsed || "live")}", `
        : status === "finished"
          ? `elapsed: "FT", `
          : ""
    const homeScorersPart = scorersToTs(homeScorers).replace("homeScorers", "homeScorers")
    const awayScorersPart = awayScorersToTs(awayScorers)
    const homeLabelPart = game.home_team_label
      ? `homeTeamLabel: "${esc(game.home_team_label)}", `
      : ""
    const awayLabelPart = game.away_team_label
      ? `awayTeamLabel: "${esc(game.away_team_label)}", `
      : ""

    matchLines.push(
      `  { id: "wc26-${game.id}", apiId: "${game.id}", stage: "${stage}", ${groupPart}homeTeam: "${homeCode}" as TeamCode, awayTeam: "${awayCode}" as TeamCode, date: "${date}", ${timePart}${persianPart}${stadiumPart}${scorePart}${homeScorersPart}${awayScorersPart}${homeLabelPart}${awayLabelPart}${elapsedPart}status: "${status}" },`,
    )
  }

  const matchesTs = `import type { Match } from "@/types/wc26";
import type { TeamCode } from "@/types/wc26";

/**
 * All 104 matches — FIFA World Cup 2026
 * 72 group stage + 32 knockout matches
 * Synced from https://worldcup26.ir — ${new Date().toISOString().slice(0, 10)}
 */
export const matches: readonly Match[] = [
${matchLines.join("\n")}
];
`
  writeFileSync(join(DATA_DIR, "matches.ts"), matchesTs)
  console.log(`  wrote src/data/matches.ts (${games.length} games)`)

  console.log("Done!")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
