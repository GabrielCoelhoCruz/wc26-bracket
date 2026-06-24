import type { Match } from "@/types/wc26";
import type { TeamCode } from "@/types/wc26";

/**
 * All 80 matches of the 2026 FIFA World Cup.
 * 48 group-stage matches (3 per group) + 32 knockout matches.
 */
export const matches: readonly Match[] = [

  // ═══════════════════════════════════════════════
  // GROUP STAGE — 48 matches · June 11–27, 2026
  // ═══════════════════════════════════════════════

  // ── Group A ──
  { id: "group-a-1", stage: "group", group: "A", homeTeam: "CAN" as TeamCode, awayTeam: "MEX" as TeamCode, date: "2026-06-11", stadium: "BC Place", city: "Vancouver", status: "scheduled" },
  { id: "group-a-2", stage: "group", group: "A", homeTeam: "MEX" as TeamCode, awayTeam: "USA" as TeamCode, date: "2026-06-14", stadium: "Estadio Azteca", city: "Mexico City", status: "scheduled" },
  { id: "group-a-3", stage: "group", group: "A", homeTeam: "USA" as TeamCode, awayTeam: "CAN" as TeamCode, date: "2026-06-18", stadium: "SoFi Stadium", city: "Los Angeles", status: "scheduled" },

  // ── Group B ──
  { id: "group-b-1", stage: "group", group: "B", homeTeam: "BRA" as TeamCode, awayTeam: "URU" as TeamCode, date: "2026-06-12", stadium: "MetLife Stadium", city: "East Rutherford", status: "scheduled" },
  { id: "group-b-2", stage: "group", group: "B", homeTeam: "URU" as TeamCode, awayTeam: "PAR" as TeamCode, date: "2026-06-15", stadium: "Mercedes-Benz Stadium", city: "Atlanta", status: "scheduled" },
  { id: "group-b-3", stage: "group", group: "B", homeTeam: "PAR" as TeamCode, awayTeam: "BRA" as TeamCode, date: "2026-06-19", stadium: "Arena Corinthians", city: "São Paulo", status: "scheduled" },

  // ── Group C ──
  { id: "group-c-1", stage: "group", group: "C", homeTeam: "ARG" as TeamCode, awayTeam: "COL" as TeamCode, date: "2026-06-13", stadium: "Hard Rock Stadium", city: "Miami", status: "scheduled" },
  { id: "group-c-2", stage: "group", group: "C", homeTeam: "COL" as TeamCode, awayTeam: "PER" as TeamCode, date: "2026-06-16", stadium: "Levi's Stadium", city: "Santa Clara", status: "scheduled" },
  { id: "group-c-3", stage: "group", group: "C", homeTeam: "PER" as TeamCode, awayTeam: "ARG" as TeamCode, date: "2026-06-20", stadium: "Estadio Monumental", city: "Lima", status: "scheduled" },

  // ── Group D ──
  { id: "group-d-1", stage: "group", group: "D", homeTeam: "FRA" as TeamCode, awayTeam: "NED" as TeamCode, date: "2026-06-12", stadium: "AT&T Stadium", city: "Arlington", status: "scheduled" },
  { id: "group-d-2", stage: "group", group: "D", homeTeam: "NED" as TeamCode, awayTeam: "POL" as TeamCode, date: "2026-06-15", stadium: "Lincoln Financial Field", city: "Philadelphia", status: "scheduled" },
  { id: "group-d-3", stage: "group", group: "D", homeTeam: "POL" as TeamCode, awayTeam: "FRA" as TeamCode, date: "2026-06-19", stadium: "PGE Narodowy", city: "Warsaw", status: "scheduled" },

  // ── Group E ──
  { id: "group-e-1", stage: "group", group: "E", homeTeam: "ENG" as TeamCode, awayTeam: "BEL" as TeamCode, date: "2026-06-14", stadium: "Wembley Stadium", city: "London", status: "scheduled" },
  { id: "group-e-2", stage: "group", group: "E", homeTeam: "BEL" as TeamCode, awayTeam: "POR" as TeamCode, date: "2026-06-17", stadium: "King Baudouin Stadium", city: "Brussels", status: "scheduled" },
  { id: "group-e-3", stage: "group", group: "E", homeTeam: "POR" as TeamCode, awayTeam: "ENG" as TeamCode, date: "2026-06-21", stadium: "Estádio da Luz", city: "Lisbon", status: "scheduled" },

  // ── Group F ──
  { id: "group-f-1", stage: "group", group: "F", homeTeam: "ESP" as TeamCode, awayTeam: "GER" as TeamCode, date: "2026-06-13", stadium: "Estadio Santiago Bernabéu", city: "Madrid", status: "scheduled" },
  { id: "group-f-2", stage: "group", group: "F", homeTeam: "GER" as TeamCode, awayTeam: "CRO" as TeamCode, date: "2026-06-16", stadium: "Allianz Arena", city: "Munich", status: "scheduled" },
  { id: "group-f-3", stage: "group", group: "F", homeTeam: "CRO" as TeamCode, awayTeam: "ESP" as TeamCode, date: "2026-06-20", stadium: "Stadion Poljud", city: "Split", status: "scheduled" },

  // ── Group G ──
  { id: "group-g-1", stage: "group", group: "G", homeTeam: "ITA" as TeamCode, awayTeam: "SUI" as TeamCode, date: "2026-06-14", stadium: "Stadio Olimpico", city: "Rome", status: "scheduled" },
  { id: "group-g-2", stage: "group", group: "G", homeTeam: "SUI" as TeamCode, awayTeam: "DEN" as TeamCode, date: "2026-06-17", stadium: "Stade de Suisse", city: "Bern", status: "scheduled" },
  { id: "group-g-3", stage: "group", group: "G", homeTeam: "DEN" as TeamCode, awayTeam: "ITA" as TeamCode, date: "2026-06-21", stadium: "Parken Stadium", city: "Copenhagen", status: "scheduled" },

  // ── Group H ──
  { id: "group-h-1", stage: "group", group: "H", homeTeam: "MAR" as TeamCode, awayTeam: "SEN" as TeamCode, date: "2026-06-12", stadium: "Stade Mohammed V", city: "Casablanca", status: "scheduled" },
  { id: "group-h-2", stage: "group", group: "H", homeTeam: "SEN" as TeamCode, awayTeam: "GHA" as TeamCode, date: "2026-06-16", stadium: "Stade Abdoulaye Wade", city: "Diamniadio", status: "scheduled" },
  { id: "group-h-3", stage: "group", group: "H", homeTeam: "GHA" as TeamCode, awayTeam: "MAR" as TeamCode, date: "2026-06-20", stadium: "Accra Sports Stadium", city: "Accra", status: "scheduled" },

  // ── Group I ──
  { id: "group-i-1", stage: "group", group: "I", homeTeam: "NGA" as TeamCode, awayTeam: "CMR" as TeamCode, date: "2026-06-13", stadium: "Moshood Abiola Stadium", city: "Abuja", status: "scheduled" },
  { id: "group-i-2", stage: "group", group: "I", homeTeam: "CMR" as TeamCode, awayTeam: "TUN" as TeamCode, date: "2026-06-17", stadium: "Stade Ahmadou Ahidjo", city: "Yaoundé", status: "scheduled" },
  { id: "group-i-3", stage: "group", group: "I", homeTeam: "TUN" as TeamCode, awayTeam: "NGA" as TeamCode, date: "2026-06-21", stadium: "Stade Olympique de Radès", city: "Tunis", status: "scheduled" },

  // ── Group J ──
  { id: "group-j-1", stage: "group", group: "J", homeTeam: "ALG" as TeamCode, awayTeam: "EGY" as TeamCode, date: "2026-06-11", stadium: "Stade Nelson Mandela", city: "Algiers", status: "scheduled" },
  { id: "group-j-2", stage: "group", group: "J", homeTeam: "EGY" as TeamCode, awayTeam: "RSA" as TeamCode, date: "2026-06-15", stadium: "Cairo International Stadium", city: "Cairo", status: "scheduled" },
  { id: "group-j-3", stage: "group", group: "J", homeTeam: "RSA" as TeamCode, awayTeam: "ALG" as TeamCode, date: "2026-06-19", stadium: "FNB Stadium", city: "Johannesburg", status: "scheduled" },

  // ── Group K ──
  { id: "group-k-1", stage: "group", group: "K", homeTeam: "JPN" as TeamCode, awayTeam: "KOR" as TeamCode, date: "2026-06-14", stadium: "Nissan Stadium", city: "Yokohama", status: "scheduled" },
  { id: "group-k-2", stage: "group", group: "K", homeTeam: "KOR" as TeamCode, awayTeam: "AUS" as TeamCode, date: "2026-06-18", stadium: "Seoul World Cup Stadium", city: "Seoul", status: "scheduled" },
  { id: "group-k-3", stage: "group", group: "K", homeTeam: "AUS" as TeamCode, awayTeam: "JPN" as TeamCode, date: "2026-06-22", stadium: "Stadium Australia", city: "Sydney", status: "scheduled" },

  // ── Group L ──
  { id: "group-l-1", stage: "group", group: "L", homeTeam: "KSA" as TeamCode, awayTeam: "IRN" as TeamCode, date: "2026-06-12", stadium: "King Abdullah Sports City", city: "Jeddah", status: "scheduled" },
  { id: "group-l-2", stage: "group", group: "L", homeTeam: "IRN" as TeamCode, awayTeam: "QAT" as TeamCode, date: "2026-06-16", stadium: "Azadi Stadium", city: "Tehran", status: "scheduled" },
  { id: "group-l-3", stage: "group", group: "L", homeTeam: "QAT" as TeamCode, awayTeam: "KSA" as TeamCode, date: "2026-06-20", stadium: "Lusail Iconic Stadium", city: "Lusail", status: "scheduled" },

  // ── Group M ──
  { id: "group-m-1", stage: "group", group: "M", homeTeam: "CRC" as TeamCode, awayTeam: "JAM" as TeamCode, date: "2026-06-11", stadium: "Estadio Nacional", city: "San José", status: "scheduled" },
  { id: "group-m-2", stage: "group", group: "M", homeTeam: "JAM" as TeamCode, awayTeam: "PAN" as TeamCode, date: "2026-06-15", stadium: "Independence Park", city: "Kingston", status: "scheduled" },
  { id: "group-m-3", stage: "group", group: "M", homeTeam: "PAN" as TeamCode, awayTeam: "CRC" as TeamCode, date: "2026-06-19", stadium: "Estadio Rommel Fernández", city: "Panama City", status: "scheduled" },

  // ── Group N ──
  { id: "group-n-1", stage: "group", group: "N", homeTeam: "ECU" as TeamCode, awayTeam: "CHI" as TeamCode, date: "2026-06-13", stadium: "Estadio Monumental Banco Pichincha", city: "Guayaquil", status: "scheduled" },
  { id: "group-n-2", stage: "group", group: "N", homeTeam: "CHI" as TeamCode, awayTeam: "VEN" as TeamCode, date: "2026-06-17", stadium: "Estadio Nacional", city: "Santiago", status: "scheduled" },
  { id: "group-n-3", stage: "group", group: "N", homeTeam: "VEN" as TeamCode, awayTeam: "ECU" as TeamCode, date: "2026-06-21", stadium: "Estadio Olímpico", city: "Caracas", status: "scheduled" },

  // ── Group O ──
  { id: "group-o-1", stage: "group", group: "O", homeTeam: "SRB" as TeamCode, awayTeam: "SWE" as TeamCode, date: "2026-06-14", stadium: "Stadion Rajko Mitić", city: "Belgrade", status: "scheduled" },
  { id: "group-o-2", stage: "group", group: "O", homeTeam: "SWE" as TeamCode, awayTeam: "NOR" as TeamCode, date: "2026-06-18", stadium: "Friends Arena", city: "Stockholm", status: "scheduled" },
  { id: "group-o-3", stage: "group", group: "O", homeTeam: "NOR" as TeamCode, awayTeam: "SRB" as TeamCode, date: "2026-06-22", stadium: "Ullevaal Stadion", city: "Oslo", status: "scheduled" },

  // ── Group P ──
  { id: "group-p-1", stage: "group", group: "P", homeTeam: "UKR" as TeamCode, awayTeam: "NZL" as TeamCode, date: "2026-06-11", stadium: "NSC Olimpiyskiy", city: "Kyiv", status: "scheduled" },
  { id: "group-p-2", stage: "group", group: "P", homeTeam: "NZL" as TeamCode, awayTeam: "IRQ" as TeamCode, date: "2026-06-15", stadium: "Eden Park", city: "Auckland", status: "scheduled" },
  { id: "group-p-3", stage: "group", group: "P", homeTeam: "IRQ" as TeamCode, awayTeam: "UKR" as TeamCode, date: "2026-06-19", stadium: "Basra International Stadium", city: "Basra", status: "scheduled" },

  // ═══════════════════════════════════════════════
  // KNOCKOUT STAGE — Round of 32 · June 28–July 1
  // ═══════════════════════════════════════════════

  { id: "r32-1",  stage: "round_of_32", date: "2026-06-28", stadium: "MetLife Stadium", city: "East Rutherford", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r32-2",  stage: "round_of_32", date: "2026-06-28", stadium: "SoFi Stadium", city: "Los Angeles", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r32-3",  stage: "round_of_32", date: "2026-06-28", stadium: "AT&T Stadium", city: "Arlington", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r32-4",  stage: "round_of_32", date: "2026-06-28", stadium: "BC Place", city: "Vancouver", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },

  { id: "r32-5",  stage: "round_of_32", date: "2026-06-29", stadium: "Hard Rock Stadium", city: "Miami", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r32-6",  stage: "round_of_32", date: "2026-06-29", stadium: "Levi's Stadium", city: "Santa Clara", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r32-7",  stage: "round_of_32", date: "2026-06-29", stadium: "Mercedes-Benz Stadium", city: "Atlanta", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r32-8",  stage: "round_of_32", date: "2026-06-29", stadium: "NRG Stadium", city: "Houston", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },

  { id: "r32-9",  stage: "round_of_32", date: "2026-06-30", stadium: "Lincoln Financial Field", city: "Philadelphia", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r32-10", stage: "round_of_32", date: "2026-06-30", stadium: "Gillette Stadium", city: "Foxborough", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r32-11", stage: "round_of_32", date: "2026-06-30", stadium: "Estadio Azteca", city: "Mexico City", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r32-12", stage: "round_of_32", date: "2026-06-30", stadium: "Estadio BBVA", city: "Monterrey", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },

  { id: "r32-13", stage: "round_of_32", date: "2026-07-01", stadium: "Lumen Field", city: "Seattle", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r32-14", stage: "round_of_32", date: "2026-07-01", stadium: "Arrowhead Stadium", city: "Kansas City", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r32-15", stage: "round_of_32", date: "2026-07-01", stadium: "Estadio Akron", city: "Guadalajara", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r32-16", stage: "round_of_32", date: "2026-07-01", stadium: "Empower Field at Mile High", city: "Denver", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },

  // ═══════════════════════════════════════════════
  // Round of 16 · July 3–6
  // ═══════════════════════════════════════════════

  { id: "r16-1", stage: "round_of_16", date: "2026-07-03", stadium: "MetLife Stadium", city: "East Rutherford", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r16-2", stage: "round_of_16", date: "2026-07-03", stadium: "SoFi Stadium", city: "Los Angeles", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r16-3", stage: "round_of_16", date: "2026-07-04", stadium: "AT&T Stadium", city: "Arlington", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r16-4", stage: "round_of_16", date: "2026-07-04", stadium: "Hard Rock Stadium", city: "Miami", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r16-5", stage: "round_of_16", date: "2026-07-05", stadium: "Mercedes-Benz Stadium", city: "Atlanta", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r16-6", stage: "round_of_16", date: "2026-07-05", stadium: "Levi's Stadium", city: "Santa Clara", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r16-7", stage: "round_of_16", date: "2026-07-06", stadium: "Estadio Azteca", city: "Mexico City", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "r16-8", stage: "round_of_16", date: "2026-07-06", stadium: "BC Place", city: "Vancouver", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },

  // ═══════════════════════════════════════════════
  // Quarter-finals · July 9–10
  // ═══════════════════════════════════════════════

  { id: "qf-1", stage: "quarter_final", date: "2026-07-09", stadium: "SoFi Stadium", city: "Los Angeles", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "qf-2", stage: "quarter_final", date: "2026-07-09", stadium: "AT&T Stadium", city: "Arlington", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "qf-3", stage: "quarter_final", date: "2026-07-10", stadium: "MetLife Stadium", city: "East Rutherford", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "qf-4", stage: "quarter_final", date: "2026-07-10", stadium: "Mercedes-Benz Stadium", city: "Atlanta", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },

  // ═══════════════════════════════════════════════
  // Semi-finals · July 14–15
  // ═══════════════════════════════════════════════

  { id: "sf-1", stage: "semi_final", date: "2026-07-14", stadium: "AT&T Stadium", city: "Arlington", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "sf-2", stage: "semi_final", date: "2026-07-15", stadium: "SoFi Stadium", city: "Los Angeles", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },

  // ═══════════════════════════════════════════════
  // Third Place & Final · July 18–19
  // ═══════════════════════════════════════════════

  { id: "third-place", stage: "third_place", date: "2026-07-18", stadium: "Hard Rock Stadium", city: "Miami", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
  { id: "final",      stage: "final",       date: "2026-07-19", stadium: "MetLife Stadium", city: "East Rutherford", homeTeam: "" as TeamCode, awayTeam: "" as TeamCode, status: "scheduled" },
];
