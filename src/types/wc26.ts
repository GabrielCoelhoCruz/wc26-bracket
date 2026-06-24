// ---------------------------------------------------------------------------
// WC26 Bracket + Draft Game – Shared TypeScript Types
// ---------------------------------------------------------------------------

export type MatchStatus =
  | "NS"   // Not Started
  | "1H"   // First Half
  | "HT"   // Halftime
  | "2H"   // Second Half
  | "ET"   // Extra Time
  | "P"    // Penalty
  | "FT"   // Full Time
  | "AET"  // After Extra Time
  | "PEN"  // Penalties
  | "SUSP" // Suspended
  | "INT"  // Interrupted
  | "PST"  // Postponed
  | "CANC" // Cancelled
  | "ABD"  // Abandoned
  | "AWD"  // Awarded
  | "WO";  // Walkover

export interface Wc26Team {
  id: number;
  name: string;
  code: string | null;
  flagUrl: string | null;
  group: string | null;
}

export interface Wc26Score {
  home: number | null;
  away: number | null;
}

export interface Wc26Match {
  id: number;
  round: string | null;
  status: MatchStatus;
  elapsed: number | null;
  timestamp: number | null; // seconds UTC
  timezone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  group: string | null;
  homeTeam: Wc26Team;
  awayTeam: Wc26Team;
  score: {
    fullTime: Wc26Score;
    halfTime: Wc26Score;
    extraTime: Wc26Score;
    penalty: Wc26Score;
  };
  venue: string | null;
  referee: string | null;
}

export interface Wc26StandingRow {
  rank: number;
  team: Wc26Team;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface Wc26GroupStanding {
  group: string;
  rows: Wc26StandingRow[];
}

// ---------------------------------------------------------------------------
// Bracket + Draft Game Types (added for WC26 game project)
// ---------------------------------------------------------------------------

/** 3-letter team code used across the game e.g. "BRA", "ARG" */
export type TeamCode = string;

/** A single national team */
export interface Team {
  code: TeamCode;
  name: string;       // English name e.g. "Brazil"
  namePt: string;     // Portuguese name e.g. "Brasil"
  flag: string;       // Emoji flag
  group: string;      // Group letter e.g. "A" .. "P"
  rating: number;     // 1-100 overall team strength
}

/** A match in the tournament */
export interface Match {
  id: string;
  stage:
    | "group"
    | "round_of_32"
    | "round_of_16"
    | "quarter_final"
    | "semi_final"
    | "third_place"
    | "final";
  group?: string;
  homeTeam: TeamCode;
  awayTeam: TeamCode;
  date: string; // ISO date string
  stadium?: string;
  city?: string;
  homeScore?: number;
  awayScore?: number;
  status: "scheduled" | "live" | "finished";
}

/** A single slot in the knockout bracket tree */
export interface BracketSlot {
  id: string;
  matchId?: string;
  team?: TeamCode;
  nextSlotId?: string; // where the winner goes
  position: number;    // visual position in the bracket
  round: number;       // 1=round_of_32, 2=round_of_16, 3=quarter_final, 4=semi_final, 5=third_place or final
}

export interface BracketPredictionEntry {
  winner: TeamCode;
  homeScore?: number;
  awayScore?: number;
}

export type BracketPrediction = Record<string, BracketPredictionEntry>;

/** A user's bracket prediction */
export interface Bracket {
  id: string;
  slots: BracketSlot[];
  predictions: BracketPrediction;
  createdAt: string;
  score?: number;
}

/** A bracket shared via a short public hash. */
export interface SharedBracket {
  hash: string;
  predictions: BracketPrediction;
  ownerName?: string;
  createdAt: string;
}

/** A player in the draft pool */
export interface Player {
  id: string;
  name: string;
  position:
    | "GK"
    | "CB"
    | "LB"
    | "RB"
    | "DM"
    | "CM"
    | "AM"
    | "LW"
    | "RW"
    | "ST";
  team: TeamCode;
  rating: number; // 1-99
  photo?: string;
}

/** A drafted team assembled by a player */
export interface DraftTeam {
  id: string;
  players: Player[];
  formation: string; // e.g. "4-3-3"
  rating: number;    // aggregate rating
}

/** A single pick in the draft */
export interface DraftPick {
  round: number;
  options: Player[];
  chosen?: Player;
}
