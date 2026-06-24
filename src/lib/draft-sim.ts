// ---------------------------------------------------------------------------
// WC26 – Draft Match Simulation
// ---------------------------------------------------------------------------

import type { DraftTeam, Player } from "@/types/wc26";
import { calculateDraftRating } from "./draft";

export interface SimulatedMatch {
  home: DraftTeam;
  away: DraftTeam;
  homeScore: number;
  awayScore: number;
  result: "home" | "away" | "draw";
  homeAttack: number;
  awayAttack: number;
  homeDefense: number;
  awayDefense: number;
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

function extractAttributes(team: DraftTeam): TeamAttributes {
  const sums = { attack: 0, midfield: 0, defense: 0, goalkeeper: 0 };
  const counts = { attack: 0, midfield: 0, defense: 0, goalkeeper: 0 };

  for (const p of team.players) {
    const attr = weights[p.position];
    if (!attr) continue;
    sums[attr as keyof typeof sums] += p.rating;
    counts[attr as keyof typeof counts]++;
  }

  const avg = (key: keyof typeof sums) => (counts[key] ? sums[key] / counts[key] : 70);

  return {
    attack: avg("attack"),
    midfield: avg("midfield"),
    defense: avg("defense"),
    goalkeeper: avg("goalkeeper"),
    overall: calculateDraftRating(team.players),
  };
}

/**
 * Deterministic seeded PRNG.
 */
function mulberry32(seed: number) {
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

function makeSeed(home: DraftTeam, away: DraftTeam): number {
  return cyrb53(home.id + "|" + away.id);
}

/**
 * Simulate a single match between two draft teams.
 *
 * Goals are generated with a Poisson-like distribution driven by attack vs
 * defense + keeper. A little randomness makes repeated simulations varied.
 */
export function simulateMatch(home: DraftTeam, away: DraftTeam): SimulatedMatch {
  const h = extractAttributes(home);
  const a = extractAttributes(away);

  const rng = mulberry32(makeSeed(home, away));

  // Base expected goals per team
  const homeExpected = Math.max(0.1, (h.attack * 1.1 - a.defense * 0.45 - a.goalkeeper * 0.25) / 25 + 0.9);
  const awayExpected = Math.max(0.1, (a.attack - h.defense * 0.5 - h.goalkeeper * 0.3) / 28 + 0.65);

  // Midfield control shifts chances a bit
  const midfieldAdvantage = (h.midfield - a.midfield) / 100;

  // Poisson sampling via inverse CDF
  function samplePoisson(lambda: number): number {
    const L = Math.exp(-lambda);
    let p = 1;
    let k = 0;
    do {
      k++;
      p *= rng();
    } while (p > L);
    return k - 1;
  }

  const homeGoals = samplePoisson(homeExpected * (1 + midfieldAdvantage));
  const awayGoals = samplePoisson(awayExpected * (1 - midfieldAdvantage));

  return {
    home,
    away,
    homeScore: homeGoals,
    awayScore: awayGoals,
    result: homeGoals > awayGoals ? "home" : homeGoals < awayGoals ? "away" : "draw",
    homeAttack: Math.round(h.attack),
    awayAttack: Math.round(a.attack),
    homeDefense: Math.round(h.defense),
    awayDefense: Math.round(a.defense),
  };
}

/**
 * Generate a short narrative sentence about the simulated result.
 */
export function matchNarrative(match: SimulatedMatch): string {
  const { home, away, homeScore, awayScore, result } = match;
  if (result === "draw") {
    return `${home.rating} × ${away.rating} terminou empatado em ${homeScore}–${awayScore}.`;
  }
  const winner = result === "home" ? home : away;
  const loser = result === "home" ? away : home;
  const winScore = result === "home" ? homeScore : awayScore;
  const loseScore = result === "home" ? awayScore : homeScore;
  return `${winner.rating} venceu ${loser.rating} por ${winScore}–${loseScore}.`;
}
