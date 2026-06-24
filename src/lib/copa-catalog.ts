// ---------------------------------------------------------------------------
// Map projetoCopa Supabase catalog → wc26-bracket types
// ---------------------------------------------------------------------------

import { teams as staticTeams } from "@/data/teams";
import type {
  CopaFootballFixture,
  CopaFootballTeam,
  CopaFootballVenue,
} from "@/lib/supabase/catalog";
import type { Match, Stadium, Team, TeamCode } from "@/types/wc26";

const FIFA_BY_NAME = new Map(
  staticTeams.map((t) => [t.name.toLowerCase(), t.code as TeamCode]),
);

const FIFA_ALIASES: Record<string, TeamCode> = {
  brasil: "BRA",
  brazil: "BRA",
  "united states": "USA",
  "south korea": "KOR",
  "south africa": "RSA",
  "saudi arabia": "KSA",
  "czech republic": "CZE",
  "ivory coast": "CIV",
  "cape verde": "CPV",
  "new zealand": "NZL",
  "dr congo": "COD",
  "democratic republic of the congo": "COD",
  scotland: "SCO",
  england: "ENG",
  netherlands: "NED",
  holanda: "NED",
  germany: "GER",
  alemanha: "GER",
  spain: "ESP",
  espanha: "ESP",
  france: "FRA",
  frança: "FRA",
  mexico: "MEX",
  méxico: "MEX",
  "bosnia & herzegovina": "BIH",
  "bosnia-herzegovina": "BIH",
  "bosnia and herzegovina": "BIH",
  curaçao: "CUW",
  curacao: "CUW",
};

function resolveTeamCode(name: string): TeamCode | "TBD" {
  const key = name.trim().toLowerCase();
  return FIFA_ALIASES[key] ?? FIFA_BY_NAME.get(key) ?? "TBD";
}

function findStaticForCopa(
  copa: CopaFootballTeam,
  base: readonly Team[],
): Team | undefined {
  const code = copa.country_code?.toUpperCase();
  if (code) {
    const byFifa = base.find((t) => t.code === code);
    if (byFifa) return byFifa;
    const byIso = base.find((t) => t.iso2?.toUpperCase() === code);
    if (byIso) return byIso;
  }

  const nameKey = copa.name.trim().toLowerCase();
  const byName = base.find((t) => t.name.toLowerCase() === nameKey);
  if (byName) return byName;

  const aliasCode = FIFA_ALIASES[nameKey];
  if (aliasCode) return base.find((t) => t.code === aliasCode);

  const slugKey = copa.slug.replace(/-/g, " ").toLowerCase();
  const slugCode = FIFA_ALIASES[slugKey];
  if (slugCode) return base.find((t) => t.code === slugCode);

  return undefined;
}

function normalizeGroupName(group: string | null): string | undefined {
  if (!group) return undefined;
  return group.replace(/^Grupo\s+/i, "").trim() || undefined;
}

function mapCopaStatus(short: string | null): Match["status"] {
  const s = (short ?? "").toUpperCase();
  if (["FT", "AET", "PEN", "FINISHED"].includes(s)) return "finished";
  if (["LIVE", "1H", "2H", "HT", "ET", "BT", "P"].includes(s)) return "live";
  if (["NS", "TBD", "SCHEDULED", "PST"].includes(s)) return "scheduled";
  return "scheduled";
}

function mapCopaStage(stage: string | null, round: string | null): Match["stage"] {
  const value = `${stage ?? ""} ${round ?? ""}`.toLowerCase();
  if (value.includes("final") && !value.includes("semi")) {
    if (value.includes("3rd") || value.includes("third")) return "third_place";
    return "final";
  }
  if (value.includes("semi")) return "semi_final";
  if (value.includes("quarter")) return "quarter_final";
  if (value.includes("round of 16") || value.includes("r16")) return "round_of_16";
  if (value.includes("round of 32") || value.includes("r32")) return "round_of_32";
  return "group";
}

export function mapCopaFixtureToMatch(fixture: CopaFootballFixture, index: number): Match {
  const homeTeam = resolveTeamCode(fixture.home_team_name);
  const awayTeam = resolveTeamCode(fixture.away_team_name);
  const status = mapCopaStatus(fixture.status_short);
  const kickoff = fixture.kickoff_at ? new Date(fixture.kickoff_at) : null;

  return {
    id: `copa-${fixture.provider_fixture_id || index}`,
    apiId: String(fixture.provider_fixture_id),
    stage: mapCopaStage(fixture.stage, fixture.round),
    group: normalizeGroupName(fixture.group_name),
    homeTeam,
    awayTeam,
    date: kickoff ? kickoff.toISOString().slice(0, 10) : "2026-06-01",
    time: kickoff ? kickoff.toISOString().slice(11, 16) : "12:00",
    stadium: fixture.venue_name ?? undefined,
    city: fixture.venue_city ?? undefined,
    homeScore: fixture.home_goals ?? undefined,
    awayScore: fixture.away_goals ?? undefined,
    elapsed:
      status === "finished"
        ? "FT"
        : status === "live"
          ? String(fixture.elapsed ?? "live")
          : undefined,
    status,
    homeTeamLabel: homeTeam === "TBD" ? fixture.home_team_name : undefined,
    awayTeamLabel: awayTeam === "TBD" ? fixture.away_team_name : undefined,
  };
}

/** Overlay Supabase team metadata onto static 48-team roster (flags, groups, names). */
export function mergeCopaTeams(
  base: readonly Team[],
  copaTeams: CopaFootballTeam[],
): Team[] {
  if (copaTeams.length === 0) return [...base];

  const copaByCode = new Map<TeamCode, CopaFootballTeam>();
  for (const copa of copaTeams) {
    const match = findStaticForCopa(copa, base);
    if (match) copaByCode.set(match.code as TeamCode, copa);
  }

  return base.map((team) => {
    const copa = copaByCode.get(team.code as TeamCode);
    if (!copa) return { ...team };

    return {
      ...team,
      name: copa.name || team.name,
      flagUrl: copa.flag_url ?? copa.badge_url ?? team.flagUrl,
      group: normalizeGroupName(copa.group_name) ?? team.group,
    };
  });
}

function normalizeVenueKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Enrich static stadium list with Supabase venue names/cities where names align. */
export function mergeCopaVenues(
  base: readonly Stadium[],
  copaVenues: CopaFootballVenue[],
): Stadium[] {
  if (copaVenues.length === 0) return [...base];

  const byKey = new Map<string, CopaFootballVenue>();
  for (const venue of copaVenues) {
    byKey.set(normalizeVenueKey(venue.name), venue);
  }

  return base.map((stadium) => {
    const keys = [
      normalizeVenueKey(stadium.name),
      normalizeVenueKey(stadium.fifaName),
    ];
    const copa = keys.map((k) => byKey.get(k)).find(Boolean);
    if (!copa) return { ...stadium };

    return {
      ...stadium,
      name: copa.name || stadium.name,
      city: copa.city ?? stadium.city,
      country: copa.country ?? stadium.country,
    };
  });
}

function overlayMatch(base: Match, overlay: Match): Match {
  const hasResult =
    overlay.status === "finished" ||
    overlay.status === "live" ||
    overlay.homeScore != null ||
    overlay.awayScore != null;

  return {
    ...base,
    date: overlay.date ?? base.date,
    time: overlay.time ?? base.time,
    stadium: overlay.stadium ?? base.stadium,
    city: overlay.city ?? base.city,
    apiId: overlay.apiId ?? base.apiId,
    homeScore: overlay.homeScore ?? base.homeScore,
    awayScore: overlay.awayScore ?? base.awayScore,
    status: hasResult ? overlay.status : base.status,
    elapsed: overlay.elapsed ?? base.elapsed,
  };
}

/** Merge scores, kickoff, venue and status from Supabase fixtures into static bracket. */
export function mergeCopaFixturesIntoMatches(
  base: readonly Match[],
  copaFixtures: CopaFootballFixture[],
): Match[] {
  if (copaFixtures.length === 0) return [...base];

  const byTeams = new Map<string, Match>();
  const byApiId = new Map<string, Match>();

  for (const [index, fixture] of copaFixtures.entries()) {
    const mapped = mapCopaFixtureToMatch(fixture, index);
    const home = resolveTeamCode(fixture.home_team_name);
    const away = resolveTeamCode(fixture.away_team_name);
    if (home !== "TBD" && away !== "TBD") {
      byTeams.set(`${home}-${away}`, mapped);
    }
    if (mapped.apiId) byApiId.set(mapped.apiId, mapped);
  }

  return base.map((match) => {
    const byPair = byTeams.get(`${match.homeTeam}-${match.awayTeam}`);
    if (byPair) return overlayMatch(match, byPair);
    if (match.apiId) {
      const byId = byApiId.get(match.apiId);
      if (byId) return overlayMatch(match, byId);
    }
    return { ...match };
  });
}

/** @deprecated Use mergeCopaFixturesIntoMatches */
export function mergeCopaScoresIntoMatches(
  base: readonly Match[],
  copaFixtures: CopaFootballFixture[],
): Match[] {
  return mergeCopaFixturesIntoMatches(base, copaFixtures);
}
