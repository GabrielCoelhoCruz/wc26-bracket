// ---------------------------------------------------------------------------
// WC26 – Draft Match Simulation
// ---------------------------------------------------------------------------

import type { Locale } from "@/lib/i18n"
import { defaultLocale, formatMessage, getMessages } from "@/lib/i18n"

import type { DraftTeam, MatchEvent, PlayStyle, Player, SimulatedMatchResult, UserSlot } from "@/types/wc26";
import { calculateDraftRating } from "./draft";

export interface SimulatedMatch extends SimulatedMatchResult {
  home: DraftTeam;
  away: DraftTeam;
  homeAttack: number;
  awayAttack: number;
  homeDefense: number;
  awayDefense: number;
}

export interface SimulateMatchOptions {
  playStyle?: PlayStyle;
  userPlayStyle?: PlayStyle;
  seed?: number;
}

interface TeamAttributes {
  attack: number;
  midfield: number;
  defense: number;
  goalkeeper: number;
  overall: number;
}

const weights: Record<Player["position"], keyof TeamAttributes | null> = {
  GK: "goalkeeper",
  CB: "defense",
  LB: "defense",
  RB: "defense",
  DM: "midfield",
  CM: "midfield",
  AM: "attack",
  LW: "attack",
  RW: "attack",
  ST: "attack",
};

const PLAY_STYLE_MOD: Record<PlayStyle, { attack: number; defense: number }> = {
  offensive: { attack: 1.08, defense: 0.95 },
  balanced: { attack: 1, defense: 1 },
  defensive: { attack: 0.92, defense: 1.06 },
};

function extractAttributes(team: DraftTeam, playStyle: PlayStyle = "balanced"): TeamAttributes {
  const sums = { attack: 0, midfield: 0, defense: 0, goalkeeper: 0 };
  const counts = { attack: 0, midfield: 0, defense: 0, goalkeeper: 0 };

  for (const p of team.players) {
    const attr = weights[p.position];
    if (!attr) continue;
    sums[attr as keyof typeof sums] += p.rating;
    counts[attr as keyof typeof counts]++;
  }

  const avg = (key: keyof typeof sums) => (counts[key] ? sums[key] / counts[key] : 70);
  const mod = PLAY_STYLE_MOD[playStyle];

  return {
    attack: avg("attack") * mod.attack,
    midfield: avg("midfield"),
    defense: avg("defense") * mod.defense,
    goalkeeper: avg("goalkeeper"),
    overall: calculateDraftRating(team.players),
  };
}

export function mulberry32(seed: number) {
  let t = seed + 0x6d2b79f5;
  return function () {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function makeSeed(home: DraftTeam, away: DraftTeam, extra?: number): number {
  return cyrb53(home.id + "|" + away.id, extra ?? 0);
}

function samplePoisson(lambda: number, rng: () => number): number {
  const L = Math.exp(-lambda);
  let p = 1;
  let k = 0;
  do {
    k++;
    p *= rng();
  } while (p > L);
  return k - 1;
}

function pickScorer(team: DraftTeam, rng: () => number): string {
  const attackers = team.players.filter((p) =>
    ["ST", "LW", "RW", "AM", "CM"].includes(p.position),
  );
  const pool = attackers.length > 0 ? attackers : team.players;
  return pool[Math.floor(rng() * pool.length)]?.name ?? "Jogador";
}

function buildGoalEvents(
  home: DraftTeam,
  away: DraftTeam,
  homeGoals: number,
  awayGoals: number,
  rng: () => number,
): MatchEvent[] {
  const events: MatchEvent[] = [];
  for (let i = 0; i < homeGoals; i++) {
    events.push({
      minute: 5 + Math.floor(rng() * 85),
      scorer: pickScorer(home, rng),
      team: "home",
    });
  }
  for (let i = 0; i < awayGoals; i++) {
    events.push({
      minute: 5 + Math.floor(rng() * 85),
      scorer: pickScorer(away, rng),
      team: "away",
    });
  }
  return events.sort((a, b) => a.minute - b.minute);
}

export function simulatePenalties(
  home: DraftTeam,
  away: DraftTeam,
  rng: () => number,
): UserSlot {
  let homeP = 0;
  let awayP = 0;
  for (let i = 0; i < 5; i++) {
    if (rng() < 0.75 + (home.rating - 70) / 200) homeP++;
    if (rng() < 0.75 + (away.rating - 70) / 200) awayP++;
  }
  while (homeP === awayP) {
    if (rng() < 0.78) homeP++;
    if (rng() < 0.78) awayP++;
  }
  return homeP > awayP ? "home" : "away";
}

export function simulateMatch(
  home: DraftTeam,
  away: DraftTeam,
  options: SimulateMatchOptions = {},
): SimulatedMatch {
  const homeStyle = options.userPlayStyle ?? options.playStyle ?? "balanced";
  const awayStyle = options.playStyle ?? "balanced";
  const h = extractAttributes(home, homeStyle);
  const a = extractAttributes(away, awayStyle);

  const seed = options.seed ?? makeSeed(home, away);
  const rng = mulberry32(seed);

  const homeExpected = Math.max(0.1, (h.attack * 1.1 - a.defense * 0.45 - a.goalkeeper * 0.25) / 25 + 0.9);
  const awayExpected = Math.max(0.1, (a.attack - h.defense * 0.5 - h.goalkeeper * 0.3) / 28 + 0.65);
  const midfieldAdvantage = (h.midfield - a.midfield) / 100;

  const homeGoals = samplePoisson(homeExpected * (1 + midfieldAdvantage), rng);
  const awayGoals = samplePoisson(awayExpected * (1 - midfieldAdvantage), rng);

  let result: "home" | "away" | "draw" =
    homeGoals > awayGoals ? "home" : homeGoals < awayGoals ? "away" : "draw";

  let penaltyWinner: UserSlot | undefined;
  let wentToPenalties = false;

  if (result === "draw") {
    wentToPenalties = true;
    penaltyWinner = simulatePenalties(home, away, rng);
    result = penaltyWinner;
  }

  const events = buildGoalEvents(home, away, homeGoals, awayGoals, rng);

  return {
    home,
    away,
    homeScore: homeGoals,
    awayScore: awayGoals,
    result,
    penaltyWinner,
    wentToPenalties,
    events,
    homeAttack: Math.round(h.attack),
    awayAttack: Math.round(a.attack),
    homeDefense: Math.round(h.defense),
    awayDefense: Math.round(a.defense),
  };
}

export function matchNarrative(match: SimulatedMatch, locale: Locale = defaultLocale): string {
  const { home, away, homeScore, awayScore, result, wentToPenalties, penaltyWinner, events } = match
  const sim = getMessages(locale).sim
  const score = `${homeScore}–${awayScore}`

  const scorers =
    events.length > 0
      ? formatMessage(sim.goals, {
          list: events.map((e) => `${e.scorer} (${e.minute}')`).join(", "),
        })
      : ""

  if (wentToPenalties && penaltyWinner) {
    const winner = penaltyWinner === "home" ? home : away
    return formatMessage(sim.penalties, {
      score,
      rating: String(winner.rating),
      goals: scorers,
    })
  }

  if (result === "draw") {
    return formatMessage(sim.draw, {
      home: String(home.rating),
      away: String(away.rating),
      score,
      goals: scorers,
    })
  }

  const winner = result === "home" ? home : away
  const winScore = result === "home" ? homeScore : awayScore
  const loseScore = result === "home" ? awayScore : homeScore
  return formatMessage(sim.win, {
    rating: String(winner.rating),
    score: `${winScore}–${loseScore}`,
    goals: scorers,
  })
}

export function userWonMatch(match: SimulatedMatch, userSlot: UserSlot): boolean {
  if (match.wentToPenalties && match.penaltyWinner) {
    return match.penaltyWinner === userSlot;
  }
  return match.result === userSlot;
}
