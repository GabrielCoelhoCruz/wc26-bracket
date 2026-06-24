import { readFileSync, writeFileSync } from "fs";

const teamsContent = readFileSync("src/data/teams.ts", "utf8");
const codes = [...teamsContent.matchAll(/code: "([A-Z]{3})"/g)].map((m) => m[1]);
const playersContent = readFileSync("src/data/players.ts", "utf8");
const entries = [
  ...playersContent.matchAll(/p\("([^"]+)", "([A-Z]{3})", "([A-Z]+)", (\d+)\)/g),
];
const qualified = new Set(codes);
const kept = entries.filter((e) => qualified.has(e[2]));
const missing = codes.filter((c) => !kept.some((e) => e[2] === c));

const header = `import type { Player, TeamCode } from "@/types/wc26";
import { teams } from "@/data/teams";

/**
 * WC26 draft pool — only players from the 48 qualified nations (teams.ts).
 * Ratings are indicative OVR for the draft mini-game.
 */

function p(
  name: string,
  team: TeamCode,
  position: Player["position"],
  rating: number,
): Player {
  return { id: \`\${team}-\${name.toLowerCase().replace(/\\s+/g, "-")}\`, name, team, position, rating };
}

const QUALIFIED = new Set(teams.map((t) => t.code));

const rawPlayers: Player[] = [
`;

const body = kept.map((e) => `  p("${e[1]}", "${e[2]}", "${e[3]}", ${e[4]}),`).join("\n");

const additions = `
  // Additional squads for qualified teams without coverage
  p("Patrik Schick", "CZE", "ST", 81),
  p("Tomas Soucek", "CZE", "DM", 82),
  p("Antonin Kinsky", "CZE", "GK", 76),
  p("Vladimir Coufal", "CZE", "RB", 77),
  p("David Doudera", "CZE", "LB", 74),
  p("Ladislav Krejci", "CZE", "CB", 75),

  p("Ermedin Demirovic", "BIH", "ST", 78),
  p("Edin Dzeko", "BIH", "ST", 77),
  p("Miralem Pjanic", "BIH", "CM", 79),
  p("Sead Kolasinac", "BIH", "CB", 76),
  p("Ibrahim Sehic", "BIH", "GK", 73),

  p("Derrick Etienne", "HAI", "LW", 72),
  p("Frantzdy Pierrot", "HAI", "ST", 73),
  p("Johny Placide", "HAI", "GK", 71),
  p("Ricardo Adé", "HAI", "CB", 70),
  p("Bryan Alceus", "HAI", "DM", 71),

  p("Scott McTominay", "SCO", "CM", 82),
  p("Lyndon Dykes", "SCO", "ST", 74),
  p("Angus Gunn", "SCO", "GK", 75),
  p("Kieran Tierney", "SCO", "LB", 78),
  p("John McGinn", "SCO", "CM", 80),
  p("Che Adams", "SCO", "ST", 76),

  p("Hakan Calhanoglu", "TUR", "CM", 84),
  p("Arda Guler", "TUR", "AM", 82),
  p("Kenan Yildiz", "TUR", "LW", 80),
  p("Merih Demiral", "TUR", "CB", 79),
  p("Ugurcan Cakir", "TUR", "GK", 78),
  p("Baris Alper Yilmaz", "TUR", "RW", 77),

  p("Leandro Bacuna", "CUW", "CM", 72),
  p("Rangelo Janga", "CUW", "ST", 71),
  p("Eloy Room", "CUW", "GK", 73),
  p("Brandley Kuwas", "CUW", "RW", 70),
  p("Juriën Gaari", "CUW", "CB", 69),

  p("Sebastien Haller", "CIV", "ST", 80),
  p("Franck Kessie", "CIV", "CM", 82),
  p("Simon Adingra", "CIV", "LW", 79),
  p("Wilfried Singo", "CIV", "CB", 78),
  p("Yahia Fofana", "CIV", "GK", 75),

  p("Ryan Mendes", "CPV", "LW", 72),
  p("Bebe", "CPV", "RW", 71),
  p("Vozinha", "CPV", "GK", 70),
  p("Józinho", "CPV", "ST", 70),
  p("Dylan Tavares", "CPV", "LB", 71),

  p("Marcel Sabitzer", "AUT", "CM", 81),
  p("Marko Arnautovic", "AUT", "ST", 77),
  p("David Alaba", "AUT", "CB", 84),
  p("Konrad Laimer", "AUT", "DM", 82),
  p("Philipp Mwene", "AUT", "LB", 76),
  p("Patrick Pentz", "AUT", "GK", 75),

  p("Musa Al-Taamari", "JOR", "RW", 76),
  p("Yazan Al-Naimat", "JOR", "ST", 74),
  p("Yaseen Al-Bakhit", "JOR", "CB", 72),
  p("Yazeed Abulaila", "JOR", "GK", 71),

  p("Yoane Wissa", "COD", "ST", 79),
  p("Chancel Mbemba", "COD", "CB", 80),
  p("Theo Bongonda", "COD", "RW", 76),
  p("Gaël Kakuta", "COD", "AM", 75),
  p("Joel Kiassumbua", "COD", "GK", 72),

  p("Odilzhon Abdumajidov", "UZB", "ST", 73),
  p("Jaloliddin Masharipov", "UZB", "RW", 72),
  p("Eldor Shomurodov", "UZB", "ST", 74),
  p("Utkir Yusupov", "UZB", "GK", 71),
  p("Abdulla Abdullayev", "UZB", "CM", 70),
`;

const footer = `
];

export const players: readonly Player[] = rawPlayers.filter((pl) => QUALIFIED.has(pl.team));

export function getPlayersByTeam(team: TeamCode): readonly Player[] {
  return players.filter((pl) => pl.team === team);
}

export function getPlayerById(id: string): Player | undefined {
  return players.find((pl) => pl.id === id);
}

export function getQualifiedTeamCount(): number {
  return new Set(players.map((pl) => pl.team)).size;
}
`;

writeFileSync(
  "src/data/players.ts",
  header + body + additions + footer,
  "utf8",
);

console.log("Wrote players.ts:", kept.length, "kept + additions");
console.log("Missing before additions:", missing.join(", "));
