#!/usr/bin/env node
/**
 * Sync WC26 squads (26 players × 48 nations) — hybrid ingest
 * 1. API-Football /players/squads (API_FOOTBALL_KEY)
 * 2. Wikipedia squad tables
 * 3. Legacy players.ts seed + heuristic padding
 *
 * Usage: node scripts/sync-squads.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { TEAM_FAMOUS_PLAYERS } from "./data/team-famous-players.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const DATA_DIR = join(ROOT, "src", "data")
const SQUADS_PATH = join(DATA_DIR, "squads.json")
const OVERRIDES_PATH = join(DATA_DIR, "squads.overrides.json")
const TEAMS_PATH = join(DATA_DIR, "teams.ts")
const PLAYERS_PATH = join(DATA_DIR, "players.ts")
const API_BASE = "https://v3.football.api-sports.io"
const SQUAD_SIZE = 26

const SQUAD_TEMPLATE = [
  { position: "GK", count: 3 },
  { position: "CB", count: 4 },
  { position: "LB", count: 2 },
  { position: "RB", count: 2 },
  { position: "DM", count: 2 },
  { position: "CM", count: 3 },
  { position: "AM", count: 2 },
  { position: "LW", count: 2 },
  { position: "RW", count: 2 },
  { position: "ST", count: 4 },
]

const FIFA_CODE_ALIASES = {
  SCO: "GB-SCT",
}

const WIKI_SQUADS_PAGE = "2026_FIFA_World_Cup_squads"
const WIKI_USER_AGENT = "wc26-bracket-squad-sync/1.0 (educational; node)"

/** Wikipedia section titles that differ from teams.ts `name` */
const WIKI_SECTION_ALIASES = {
  "dr congo": "COD",
  "democratic republic of the congo": "COD",
  "curaçao": "CUW",
  curacao: "CUW",
}

// ---------------------------------------------------------------------------
// Env + helpers
// ---------------------------------------------------------------------------

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const path = join(ROOT, file)
    if (!existsSync(path)) continue
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/)
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
      }
    }
  }
}


function positionToRole(position) {
  if (position === "GK") return "GK"
  if (["CB", "LB", "RB"].includes(position)) return "DEF"
  if (["DM", "CM", "AM"].includes(position)) return "MID"
  return "FWD"
}

function mapApiPosition(raw) {
  const value = (raw ?? "").trim().toLowerCase()
  if (!value) return "CM"
  if (value.includes("goal") || value === "gk" || value === "g") return "GK"
  if (value.includes("left") && value.includes("back")) return "LB"
  if (value.includes("right") && value.includes("back")) return "RB"
  if (value.includes("centre-back") || value.includes("center-back") || value === "cb") return "CB"
  if (value.includes("defender") || value === "d" || value === "df") return "CB"
  if (value.includes("defensive") && value.includes("mid")) return "DM"
  if (value === "dm" || value === "cdm") return "DM"
  if (value.includes("attacking") && value.includes("mid")) return "AM"
  if (value === "am" || value === "cam") return "AM"
  if (value.includes("midfield") || value === "m" || value === "mf" || value === "cm") return "CM"
  if (value.includes("left") && value.includes("wing")) return "LW"
  if (value.includes("right") && value.includes("wing")) return "RW"
  if (value === "lw") return "LW"
  if (value === "rw") return "RW"
  if (value.includes("forward") || value.includes("striker") || value === "st" || value === "cf" || value === "f") return "ST"
  return "CM"
}

function parseTeams() {
  const content = readFileSync(TEAMS_PATH, "utf8")
  const teams = []
  const re =
    /code: "([A-Z]{3})".*?name: "([^"]+)".*?namePt: "([^"]+)".*?rating: (\d+)/gs
  let m
  while ((m = re.exec(content))) {
    teams.push({
      code: m[1],
      name: m[2],
      namePt: m[3],
      rating: Number(m[4]),
    })
  }
  return teams
}

function isSyntheticPlayer(name) {
  return (
    /\bConvocado\b/i.test(name) ||
    /\s(GK|CB|LB|RB|DM|CM|AM|LW|RW|ST)(\s+\d+)?$/i.test(name)
  )
}

function buildTeamNameIndex(teams) {
  const byName = new Map()
  for (const team of teams) {
    byName.set(normalizeNameKey(team.name), team.code)
    byName.set(normalizeNameKey(team.namePt), team.code)
  }
  for (const [alias, code] of Object.entries(WIKI_SECTION_ALIASES)) {
    byName.set(normalizeNameKey(alias), code)
  }
  return byName
}

function parseLegacyPlayers() {
  if (!existsSync(PLAYERS_PATH)) return new Map()
  const content = readFileSync(PLAYERS_PATH, "utf8")
  const byTeam = new Map()
  const re = /p\("([^"]+)", "([A-Z]{3})", "([A-Z]+)", (\d+)\)/g
  let m
  while ((m = re.exec(content))) {
    const entry = {
      name: m[1],
      position: m[3],
      rating: Number(m[4]),
      role: positionToRole(m[3]),
    }
    if (!byTeam.has(m[2])) byTeam.set(m[2], [])
    byTeam.get(m[2]).push(entry)
  }
  return byTeam
}

function loadOverrides() {
  if (!existsSync(OVERRIDES_PATH)) return {}
  return JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"))
}

function estimateRating(teamRating, position, indexInSquad) {
  const posBonus = {
    GK: 1,
    CB: 0,
    LB: 0,
    RB: 0,
    DM: 0,
    CM: 1,
    AM: 2,
    LW: 2,
    RW: 2,
    ST: 3,
  }
  const depthPenalty = Math.floor(indexInSquad / 4) * 2
  const raw = teamRating + (posBonus[position] ?? 0) - depthPenalty - 4
  return Math.min(94, Math.max(58, raw))
}

function mergePlayer(existing, incoming) {
  return {
    name: incoming.name ?? existing.name,
    position: incoming.position ?? existing.position,
    rating: incoming.rating ?? existing.rating,
    shirtNumber: incoming.shirtNumber ?? existing.shirtNumber,
    club: incoming.club ?? existing.club,
    role: positionToRole(incoming.position ?? existing.position),
  }
}

function dedupeByName(players) {
  const seen = new Map()
  for (const p of players) {
    const key = p.name.toLowerCase()
    if (seen.has(key)) {
      seen.set(key, mergePlayer(seen.get(key), p))
    } else {
      seen.set(key, { ...p, role: positionToRole(p.position) })
    }
  }
  return [...seen.values()]
}

// ---------------------------------------------------------------------------
// API-Football
// ---------------------------------------------------------------------------

async function apiFetch(path, params = {}) {
  const key = process.env.API_FOOTBALL_KEY
  if (!key) return null
  const qs = new URLSearchParams(params).toString()
  const url = `${API_BASE}${path}?${qs}`
  const res = await fetch(url, {
    headers: { "x-apisports-key": key },
  })
  if (!res.ok) return null
  const data = await res.json()
  if (data.errors && Object.keys(data.errors).length > 0) return null
  return data
}

async function resolveApiTeamId(code) {
  const fifaCode = FIFA_CODE_ALIASES[code] ?? code
  const data = await apiFetch("/teams", { code: fifaCode })
  const team = data?.response?.[0]?.team
  return team?.id ?? null
}

async function fetchApiSquad(code) {
  const teamId = await resolveApiTeamId(code)
  if (!teamId) return []
  const data = await apiFetch("/players/squads", { team: String(teamId) })
  const players = data?.response?.[0]?.players ?? []
  return players.map((pl, idx) => ({
    name: pl.name,
    position: mapApiPosition(pl.position),
    rating: estimateRating(80, mapApiPosition(pl.position), idx),
    shirtNumber: pl.number ? Number(pl.number) : undefined,
    club: undefined,
    role: positionToRole(mapApiPosition(pl.position)),
  }))
}

// ---------------------------------------------------------------------------
// Wikipedia — official FIFA squads on one page
// https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads
// ---------------------------------------------------------------------------

function decodeHtmlText(value) {
  return value
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&([a-z]+);/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizeNameKey(value) {
  return decodeHtmlText(value)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
}

function mapWikiFifaPosition(posRaw) {
  const value = (posRaw ?? "").trim()
  const fifa = value.match(/\b(GK|DF|MF|FW)\b/i)?.[1]?.toUpperCase()
  if (fifa === "GK") return "GK"
  if (fifa === "DF") return "CB"
  if (fifa === "MF") return "CM"
  if (fifa === "FW") return "ST"
  return mapApiPosition(value)
}

function resolveWikiSectionCode(sectionName, nameToCode) {
  const key = normalizeNameKey(sectionName)
  return nameToCode.get(key) ?? WIKI_SECTION_ALIASES[key] ?? null
}

async function fetchWikipediaSquadsPage() {
  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(WIKI_SQUADS_PAGE)}&prop=text&format=json&origin=*`
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, {
      headers: { "User-Agent": WIKI_USER_AGENT },
    })
    if (!res.ok) {
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, attempt * 5000))
        continue
      }
      throw new Error(`Wikipedia HTTP ${res.status}`)
    }
    const text = await res.text()
    if (text.startsWith("You are making too many requests")) {
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, attempt * 8000))
        continue
      }
      throw new Error("Wikipedia rate limit")
    }
    const data = JSON.parse(text)
    if (data.error) {
      throw new Error(data.error.info ?? "Wikipedia parse error")
    }
    return data?.parse?.text?.["*"] ?? ""
  }
  return ""
}

function extractSectionTitle(section) {
  const modern = section.match(/^\s*id="[^"]*">([^<]+)<\/h3/i)
  if (modern) return decodeHtmlText(modern[1])

  const legacy = section.match(/class="mw-headline"[^>]*>([\s\S]*?)<\/span>/i)
  if (!legacy) return null
  return decodeHtmlText(legacy[1].replace(/<[^>]+>/g, ""))
}

function parseWikiSquadsPage(html, nameToCode) {
  const squads = new Map()
  const sections = html.split(/<h3\b/i).slice(1)

  for (const section of sections) {
    const sectionName = extractSectionTitle(section)
    if (!sectionName) continue
    if (
      /^(group |age$|player representation|average age|coach representation|\d+\.)/i.test(
        sectionName,
      )
    ) {
      continue
    }

    const code = resolveWikiSectionCode(sectionName, nameToCode)
    if (!code) continue

    const players = parseWikiSquadHtml(section)
    if (players.length >= 15) {
      squads.set(code, players)
    }
  }

  return squads
}

function parseWikiSquadHtml(html) {
  const players = []
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let row
  while ((row = rowRe.exec(html))) {
    const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) =>
      decodeHtmlText(c[1].replace(/<[^>]+>/g, " ")),
    )
    if (cells.length < 3) continue

    let shirtNumber
    let posRaw = ""
    let name = ""
    let club = ""

    if (/^\d{1,2}$/.test(cells[0])) {
      shirtNumber = Number(cells[0])
      posRaw = cells[1] ?? ""
      name = cells[2] ?? ""
      club = cells[cells.length - 1] ?? ""
    } else if (/^(GK|DF|MF|FW|\d\s)/i.test(cells[0]) || /goalkeeper|defender|midfielder|forward/i.test(cells[0])) {
      posRaw = cells[0]
      name = cells[1] ?? ""
      club = cells[cells.length - 1] ?? ""
    } else {
      continue
    }

    name = name.replace(/\s*\([^)]*\)\s*/g, "").trim()
    if (!name || name.length < 2) continue
    if (/^(pos|player|no|number|date of birth|caps|goals|club)/i.test(name)) continue

    const position = mapWikiFifaPosition(posRaw)
    players.push({
      name,
      position,
      rating: estimateRating(75, position, players.length),
      shirtNumber,
      club: club && !/^\d+$/.test(club) ? club : undefined,
      role: positionToRole(position),
    })
  }
  return dedupeByName(players)
}

function finalizeSquad(players, teamCode, teamName, teamRating) {
  const cleaned = dedupeByName(players.filter((p) => !isSyntheticPlayer(p.name)))
  if (cleaned.length >= SQUAD_SIZE) {
    return cleaned.slice(0, SQUAD_SIZE).map((p, idx) => ({
      ...p,
      shirtNumber: p.shirtNumber ?? idx + 1,
      rating: Math.round(p.rating ?? estimateRating(teamRating, p.position, idx)),
      role: p.role ?? positionToRole(p.position),
    }))
  }
  return padSquadTo26(cleaned, teamCode, teamName, teamRating)
}

// ---------------------------------------------------------------------------
// Padding to 26
// ---------------------------------------------------------------------------

function padSquadTo26(players, teamCode, teamName, teamRating) {
  let squad = dedupeByName(players)
  const usedNames = new Set(squad.map((p) => p.name.toLowerCase()))

  const slots = []
  for (const { position, count } of SQUAD_TEMPLATE) {
    for (let i = 0; i < count; i++) slots.push(position)
  }

  const byPosition = new Map()
  for (const p of squad) {
    if (!byPosition.has(p.position)) byPosition.set(p.position, [])
    byPosition.get(p.position).push(p)
  }

  const result = []
  const assigned = new Set()

  for (let i = 0; i < slots.length; i++) {
    const needed = slots[i]
    const pool = byPosition.get(needed) ?? []
    const existing = pool.find((p) => !assigned.has(p.name.toLowerCase()))
    if (existing) {
      assigned.add(existing.name.toLowerCase())
      result.push({
        ...existing,
        shirtNumber: existing.shirtNumber ?? i + 1,
        rating: existing.rating ?? estimateRating(teamRating, needed, i),
      })
      continue
    }

    // Try any player that can fill via same role
    const role = positionToRole(needed)
    const rolePositions =
      role === "DEF"
        ? ["CB", "LB", "RB"]
        : role === "MID"
          ? ["CM", "DM", "AM"]
          : role === "FWD"
            ? ["ST", "LW", "RW"]
            : ["GK"]
    let filler = null
    for (const pos of rolePositions) {
      const altPool = byPosition.get(pos) ?? []
      filler = altPool.find((p) => !assigned.has(p.name.toLowerCase()))
      if (filler) break
    }

    if (filler) {
      assigned.add(filler.name.toLowerCase())
      result.push({
        ...filler,
        position: needed,
        role,
        shirtNumber: filler.shirtNumber ?? i + 1,
      })
      continue
    }

    const famous = TEAM_FAMOUS_PLAYERS[teamName] ?? []
    let n = 1
    let syntheticName = famous.length
      ? `${famous[n % famous.length]} ${needed}`
      : `${teamName} Convocado ${needed} ${n}`
    while (usedNames.has(syntheticName.toLowerCase())) {
      n++
      syntheticName = famous.length
        ? `${famous[n % famous.length]} ${needed} ${n}`
        : `${teamName} Convocado ${needed} ${n}`
    }
    usedNames.add(syntheticName.toLowerCase())
    result.push({
      name: syntheticName,
      position: needed,
      rating: estimateRating(teamRating, needed, i),
      shirtNumber: i + 1,
      role,
    })
  }

  return result.slice(0, SQUAD_SIZE)
}

function applyOverrides(squad, overrides) {
  if (!overrides?.length) return squad
  const byName = new Map(squad.map((p) => [p.name.toLowerCase(), p]))
  for (const o of overrides) {
    const key = o.name.toLowerCase()
    if (byName.has(key)) {
      byName.set(key, mergePlayer(byName.get(key), o))
    } else {
      byName.set(key, { ...o, role: positionToRole(o.position) })
    }
  }
  return [...byName.values()]
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  loadEnv()
  const teams = parseTeams()
  const nameToCode = buildTeamNameIndex(teams)
  const legacy = parseLegacyPlayers()
  const allOverrides = loadOverrides()
  const squads = {}
  const stats = { api: 0, wiki: 0, legacy: 0, padded: 0 }

  console.log(`Fetching Wikipedia: ${WIKI_SQUADS_PAGE}...`)
  let wikiSquads = new Map()
  try {
    const wikiHtml = await fetchWikipediaSquadsPage()
    wikiSquads = parseWikiSquadsPage(wikiHtml, nameToCode)
    console.log(`  Wikipedia: ${wikiSquads.size} nations with squad tables\n`)
  } catch (error) {
    console.warn(`  Wikipedia fetch failed: ${error instanceof Error ? error.message : error}\n`)
  }

  console.log(`Syncing ${teams.length} nations → ${SQUAD_SIZE} players each...`)

  for (const team of teams) {
    const code = team.code
    let merged = []
    let src = "padded"

    const wikiPlayers = wikiSquads.get(code) ?? []
    if (wikiPlayers.length >= 20) {
      merged = [...wikiPlayers]
      stats.wiki++
      src = "wiki"
    }

    const apiPlayers = await fetchApiSquad(code)
    if (apiPlayers.length >= 11) {
      merged = dedupeByName([...apiPlayers, ...merged])
      stats.api++
      src = merged.length >= SQUAD_SIZE ? "api+wiki" : "api"
    }

    if (merged.length < 11) {
      const legacyPlayers = (legacy.get(code) ?? []).filter((p) => !isSyntheticPlayer(p.name))
      if (legacyPlayers.length) {
        merged = dedupeByName([...merged, ...legacyPlayers])
        stats.legacy++
        src = merged.length >= SQUAD_SIZE ? "legacy" : "legacy+padded"
      }
    }

    merged = applyOverrides(merged, allOverrides[code])
    const squad = finalizeSquad(merged, code, team.name, team.rating)

    const synthetic = squad.filter((p) => isSyntheticPlayer(p.name)).length
    if (synthetic > 0) stats.padded++

    squads[code] = squad.map((p, idx) => ({
      name: p.name,
      position: p.position,
      rating: Math.round(p.rating),
      shirtNumber: p.shirtNumber ?? idx + 1,
      ...(p.club ? { club: p.club } : {}),
      role: p.role ?? positionToRole(p.position),
    }))

    if (wikiPlayers.length >= 20 && synthetic === 0) src = "wiki"
    console.log(`  ${code}: ${squads[code].length} players (${src})`)
  }

  const meta = {
    generatedAt: new Date().toISOString(),
    squadSize: SQUAD_SIZE,
    nations: teams.length,
    wikiPage: WIKI_SQUADS_PAGE,
    sources: stats,
  }

  writeFileSync(
    SQUADS_PATH,
    JSON.stringify({ meta, squads }, null, 2),
    "utf8",
  )
  console.log(`\nWrote ${SQUADS_PATH}`)
  console.log(`  API: ${stats.api} nations, Wiki: ${stats.wiki}, Legacy seed: ${stats.legacy}, Padded: ${stats.padded}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
