import { readFileSync } from "fs";

const SQUAD_SIZE = 26;
const squadsContent = readFileSync("src/data/squads.json", "utf8");
const squadsFile = JSON.parse(squadsContent);
const squads = squadsFile.squads ?? squadsFile;

const teamsContent = readFileSync("src/data/teams.ts", "utf8");
const codes = [...teamsContent.matchAll(/code: "([A-Z]{3})"/g)].map((m) => m[1]);

const DEF = new Set(["CB", "LB", "RB"]);
const MID = new Set(["DM", "CM", "AM"]);
const critical = { GK: 2, DEF: 4, MID: 4, ST: 2 };
const missing = [];
let totalPlayers = 0;

for (const code of codes) {
  const roster = squads[code] ?? [];
  totalPlayers += roster.length;

  if (roster.length !== SQUAD_SIZE) {
    missing.push({ code, issue: `expected ${SQUAD_SIZE}, got ${roster.length}` });
    continue;
  }

  const gk = roster.filter((p) => p.position === "GK").length;
  const def = roster.filter((p) => DEF.has(p.position)).length;
  const mid = roster.filter((p) => MID.has(p.position)).length;
  const st = roster.filter((p) => p.position === "ST").length;

  const lacks = [];
  if (gk < critical.GK) lacks.push(`GK (${gk})`);
  if (def < critical.DEF) lacks.push(`DEF (${def})`);
  if (mid < critical.MID) lacks.push(`MID (${mid})`);
  if (st < critical.ST) lacks.push(`ST (${st})`);

  if (lacks.length) {
    missing.push({ code, issue: `lacks ${lacks.join(", ")}` });
  }
}

console.log(`Nations: ${codes.length}`);
console.log(`Total players: ${totalPlayers} (expected ${codes.length * SQUAD_SIZE})`);

if (missing.length === 0) {
  console.log(`All ${codes.length} nations have ${SQUAD_SIZE} players with position coverage`);
} else {
  console.log("Validation failures:");
  for (const m of missing) {
    console.log(`  ${m.code}: ${m.issue}`);
  }
  process.exit(1);
}
