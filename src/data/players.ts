import type { Player, SquadPlayerSeed, TeamCode } from "@/types/wc26";
import { teams } from "@/data/teams";
import { positionToRole, sortSquadPlayers } from "@/lib/position-map";
import squadsData from "@/data/squads.json";

/**
 * WC26 draft pool — 26 players per qualified nation (squads.json).
 * Regenerate: npm run sync:squads
 */

interface SquadsFile {
  meta: { generatedAt: string; squadSize: number; nations: number };
  squads: Record<string, SquadPlayerSeed[]>;
}

const QUALIFIED = new Set(teams.map((t) => t.code));
const squadsFile = squadsData as SquadsFile;

function toPlayer(team: TeamCode, seed: SquadPlayerSeed, index: number): Player {
  const role = seed.role ?? positionToRole(seed.position);
  return {
    id: `${team}-${seed.name.toLowerCase().replace(/\s+/g, "-")}`,
    name: seed.name,
    team,
    position: seed.position,
    rating: seed.rating,
    shirtNumber: seed.shirtNumber ?? index + 1,
    club: seed.club,
    role,
  };
}

function buildPlayers(): Player[] {
  const all: Player[] = [];
  for (const team of teams) {
    const code = team.code;
    if (!QUALIFIED.has(code)) continue;
    const seeds = squadsFile.squads[code] ?? [];
    const squad = seeds.map((seed, idx) => toPlayer(code, seed, idx));
    all.push(...sortSquadPlayers(squad));
  }
  return all;
}

export const players: readonly Player[] = buildPlayers();

export function getPlayersByTeam(team: TeamCode): readonly Player[] {
  return sortSquadPlayers(players.filter((pl) => pl.team === team));
}

export function getPlayerById(id: string): Player | undefined {
  return players.find((pl) => pl.id === id);
}

export function getQualifiedTeamCount(): number {
  return new Set(players.map((pl) => pl.team)).size;
}

export function getSquadSize(): number {
  return squadsFile.meta.squadSize;
}
