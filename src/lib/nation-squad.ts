// ---------------------------------------------------------------------------
// WC26 – Auto-build nation squads from player pool
// ---------------------------------------------------------------------------

import { getPlayersByTeam } from "@/data/players";
import { getFormationSlots, getFormationLabel, type FormationId } from "@/lib/formations";
import { calculateDraftRating } from "@/lib/draft";
import type { DraftTeam, Player, PlayStyle, TeamCode } from "@/types/wc26";

const POSITION_FALLBACKS: Record<Player["position"], Player["position"][]> = {
  GK: ["GK"],
  CB: ["CB", "LB", "RB", "DM"],
  LB: ["LB", "CB", "LW"],
  RB: ["RB", "CB", "RW"],
  DM: ["DM", "CM", "CB"],
  CM: ["CM", "DM", "AM"],
  AM: ["AM", "CM", "LW", "RW"],
  LW: ["LW", "AM", "RW", "ST"],
  RW: ["RW", "AM", "LW", "ST"],
  ST: ["ST", "LW", "RW", "AM"],
};

function pickBestForPosition(
  pool: readonly Player[],
  position: Player["position"],
  used: Set<string>,
): Player | undefined {
  const fallbacks = POSITION_FALLBACKS[position] ?? [position];
  for (const pos of fallbacks) {
    const candidates = pool
      .filter((p) => p.position === pos && !used.has(p.id))
      .sort((a, b) => b.rating - a.rating);
    if (candidates[0]) return candidates[0];
  }
  return pool
    .filter((p) => !used.has(p.id))
    .sort((a, b) => b.rating - a.rating)[0];
}

/** Build best XI for a nation matching formation slots */
export function buildNationSquad(
  teamCode: TeamCode,
  formation: FormationId = "4-3-3",
  playStyle: PlayStyle = "balanced",
): DraftTeam {
  const pool = getPlayersByTeam(teamCode);
  const slots = getFormationSlots(formation);
  const used = new Set<string>();
  const players: Player[] = [];

  for (const position of slots) {
    const picked = pickBestForPosition(pool, position, used);
    if (picked) {
      used.add(picked.id);
      players.push(picked);
    }
  }

  const rating = Math.round(calculateDraftRating(players));
  const styleBonus =
    playStyle === "offensive" ? 1 : playStyle === "defensive" ? -1 : 0;

  return {
    id: `nation-${teamCode}-${formation}`,
    players,
    formation: getFormationLabel(formation),
    rating: Math.min(99, Math.max(50, rating + styleBonus)),
  };
}
