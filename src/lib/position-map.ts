// ---------------------------------------------------------------------------
// WC26 – Position normalization for squad ingest
// ---------------------------------------------------------------------------

import type { Player, PlayerRole } from "@/types/wc26";

export type DraftPosition = Player["position"];

const DEF_POSITIONS = new Set<DraftPosition>(["CB", "LB", "RB"]);
const MID_POSITIONS = new Set<DraftPosition>(["DM", "CM", "AM"]);

/** Map broad role to default draft position */
export function roleToDefaultPosition(role: PlayerRole): DraftPosition {
  switch (role) {
    case "GK":
      return "GK";
    case "DEF":
      return "CB";
    case "MID":
      return "CM";
    case "FWD":
      return "ST";
  }
}

export function positionToRole(position: DraftPosition): PlayerRole {
  if (position === "GK") return "GK";
  if (DEF_POSITIONS.has(position)) return "DEF";
  if (MID_POSITIONS.has(position)) return "MID";
  return "FWD";
}

/** API-Sports / Wikipedia / free-text → draft position */
export function mapApiPosition(raw: string | null | undefined): DraftPosition {
  const value = (raw ?? "").trim().toLowerCase();
  if (!value) return "CM";

  if (value.includes("goal")) return "GK";
  if (value === "g" || value === "gk") return "GK";

  if (value.includes("left") && value.includes("back")) return "LB";
  if (value.includes("right") && value.includes("back")) return "RB";
  if (value.includes("centre-back") || value.includes("center-back") || value === "cb")
    return "CB";
  if (value.includes("defender") || value === "d" || value === "df") return "CB";

  if (value.includes("defensive") && value.includes("mid")) return "DM";
  if (value === "dm" || value === "cdm") return "DM";
  if (value.includes("attacking") && value.includes("mid")) return "AM";
  if (value === "am" || value === "cam") return "AM";
  if (value.includes("midfield") || value === "m" || value === "mf") return "CM";
  if (value === "cm") return "CM";

  if (value.includes("left") && (value.includes("wing") || value.includes("winger")))
    return "LW";
  if (value.includes("right") && (value.includes("wing") || value.includes("winger")))
    return "RW";
  if (value === "lw") return "LW";
  if (value === "rw") return "RW";
  if (value.includes("forward") || value.includes("striker") || value === "f" || value === "fw")
    return "ST";
  if (value === "st" || value === "cf") return "ST";

  return "CM";
}

const ROLE_ORDER: Record<PlayerRole, number> = {
  GK: 0,
  DEF: 1,
  MID: 2,
  FWD: 3,
};

const POSITION_ORDER: Record<DraftPosition, number> = {
  GK: 0,
  CB: 1,
  LB: 2,
  RB: 3,
  DM: 4,
  CM: 5,
  AM: 6,
  LW: 7,
  RW: 8,
  ST: 9,
};

/** Sort squad like a real call-up list (role → shirt → position → rating) */
export function compareSquadPlayers(a: Player, b: Player): number {
  const roleA = a.role ?? positionToRole(a.position);
  const roleB = b.role ?? positionToRole(b.position);
  const roleDiff = ROLE_ORDER[roleA] - ROLE_ORDER[roleB];
  if (roleDiff !== 0) return roleDiff;

  const shirtA = a.shirtNumber ?? 99;
  const shirtB = b.shirtNumber ?? 99;
  if (shirtA !== shirtB) return shirtA - shirtB;

  const posDiff = POSITION_ORDER[a.position] - POSITION_ORDER[b.position];
  if (posDiff !== 0) return posDiff;

  return b.rating - a.rating;
}

export function sortSquadPlayers(players: readonly Player[]): Player[] {
  return [...players].sort(compareSquadPlayers);
}
