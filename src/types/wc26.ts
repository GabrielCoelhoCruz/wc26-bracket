export type MatchStatus =
  | "NS" // Not Started
  | "1H" // First Half
  | "HT" // Halftime
  | "2H" // Second Half
  | "ET" // Extra Time
  | "P" // Penalty
  | "FT" // Full Time
  | "AET" // After Extra Time
  | "PEN" // Penalties
  | "SUSP" // Suspended
  | "INT" // Interrupted
  | "PST" // Postponed
  | "CANC" // Cancelled
  | "ABD" // Abandoned
  | "AWD" // Awarded
  | "WO"; // Walkover

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
