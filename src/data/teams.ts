import type { Team } from "@/types/wc26";

/**
 * All 48 teams competing in the 2026 FIFA World Cup.
 * 16 groups of 3 teams each (Groups A–P).
 */
export const teams: readonly Team[] = [
  // ── Group A (North American hosts) ──
  { code: "CAN", name: "Canada", namePt: "Canadá", flag: "🇨🇦", group: "A", rating: 74 },
  { code: "MEX", name: "Mexico", namePt: "México", flag: "🇲🇽", group: "A", rating: 79 },
  { code: "USA", name: "United States", namePt: "Estados Unidos", flag: "🇺🇸", group: "A", rating: 78 },

  // ── Group B ──
  { code: "BRA", name: "Brazil", namePt: "Brasil", flag: "🇧🇷", group: "B", rating: 93 },
  { code: "URU", name: "Uruguay", namePt: "Uruguai", flag: "🇺🇾", group: "B", rating: 83 },
  { code: "PAR", name: "Paraguay", namePt: "Paraguai", flag: "🇵🇾", group: "B", rating: 72 },

  // ── Group C ──
  { code: "ARG", name: "Argentina", namePt: "Argentina", flag: "🇦🇷", group: "C", rating: 95 },
  { code: "COL", name: "Colombia", namePt: "Colômbia", flag: "🇨🇴", group: "C", rating: 81 },
  { code: "PER", name: "Peru", namePt: "Peru", flag: "🇵🇪", group: "C", rating: 71 },

  // ── Group D ──
  { code: "FRA", name: "France", namePt: "França", flag: "🇫🇷", group: "D", rating: 92 },
  { code: "NED", name: "Netherlands", namePt: "Países Baixos", flag: "🇳🇱", group: "D", rating: 86 },
  { code: "POL", name: "Poland", namePt: "Polônia", flag: "🇵🇱", group: "D", rating: 76 },

  // ── Group E ──
  { code: "ENG", name: "England", namePt: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "E", rating: 90 },
  { code: "BEL", name: "Belgium", namePt: "Bélgica", flag: "🇧🇪", group: "E", rating: 85 },
  { code: "POR", name: "Portugal", namePt: "Portugal", flag: "🇵🇹", group: "E", rating: 88 },

  // ── Group F ──
  { code: "ESP", name: "Spain", namePt: "Espanha", flag: "🇪🇸", group: "F", rating: 89 },
  { code: "GER", name: "Germany", namePt: "Alemanha", flag: "🇩🇪", group: "F", rating: 87 },
  { code: "CRO", name: "Croatia", namePt: "Croácia", flag: "🇭🇷", group: "F", rating: 80 },

  // ── Group G ──
  { code: "ITA", name: "Italy", namePt: "Itália", flag: "🇮🇹", group: "G", rating: 84 },
  { code: "SUI", name: "Switzerland", namePt: "Suíça", flag: "🇨🇭", group: "G", rating: 77 },
  { code: "DEN", name: "Denmark", namePt: "Dinamarca", flag: "🇩🇰", group: "G", rating: 79 },

  // ── Group H ──
  { code: "MAR", name: "Morocco", namePt: "Marrocos", flag: "🇲🇦", group: "H", rating: 78 },
  { code: "SEN", name: "Senegal", namePt: "Senegal", flag: "🇸🇳", group: "H", rating: 74 },
  { code: "GHA", name: "Ghana", namePt: "Gana", flag: "🇬🇭", group: "H", rating: 72 },

  // ── Group I ──
  { code: "NGA", name: "Nigeria", namePt: "Nigéria", flag: "🇳🇬", group: "I", rating: 75 },
  { code: "CMR", name: "Cameroon", namePt: "Camarões", flag: "🇨🇲", group: "I", rating: 71 },
  { code: "TUN", name: "Tunisia", namePt: "Tunísia", flag: "🇹🇳", group: "I", rating: 70 },

  // ── Group J ──
  { code: "ALG", name: "Algeria", namePt: "Argélia", flag: "🇩🇿", group: "J", rating: 73 },
  { code: "EGY", name: "Egypt", namePt: "Egito", flag: "🇪🇬", group: "J", rating: 74 },
  { code: "RSA", name: "South Africa", namePt: "África do Sul", flag: "🇿🇦", group: "J", rating: 66 },

  // ── Group K ──
  { code: "JPN", name: "Japan", namePt: "Japão", flag: "🇯🇵", group: "K", rating: 77 },
  { code: "KOR", name: "South Korea", namePt: "Coreia do Sul", flag: "🇰🇷", group: "K", rating: 76 },
  { code: "AUS", name: "Australia", namePt: "Austrália", flag: "🇦🇺", group: "K", rating: 71 },

  // ── Group L ──
  { code: "KSA", name: "Saudi Arabia", namePt: "Arábia Saudita", flag: "🇸🇦", group: "L", rating: 68 },
  { code: "IRN", name: "Iran", namePt: "Irã", flag: "🇮🇷", group: "L", rating: 69 },
  { code: "QAT", name: "Qatar", namePt: "Catar", flag: "🇶🇦", group: "L", rating: 64 },

  // ── Group M ──
  { code: "CRC", name: "Costa Rica", namePt: "Costa Rica", flag: "🇨🇷", group: "M", rating: 67 },
  { code: "JAM", name: "Jamaica", namePt: "Jamaica", flag: "🇯🇲", group: "M", rating: 63 },
  { code: "PAN", name: "Panama", namePt: "Panamá", flag: "🇵🇦", group: "M", rating: 62 },

  // ── Group N ──
  { code: "ECU", name: "Ecuador", namePt: "Equador", flag: "🇪🇨", group: "N", rating: 73 },
  { code: "CHI", name: "Chile", namePt: "Chile", flag: "🇨🇱", group: "N", rating: 69 },
  { code: "VEN", name: "Venezuela", namePt: "Venezuela", flag: "🇻🇪", group: "N", rating: 65 },

  // ── Group O ──
  { code: "SRB", name: "Serbia", namePt: "Sérvia", flag: "🇷🇸", group: "O", rating: 75 },
  { code: "SWE", name: "Sweden", namePt: "Suécia", flag: "🇸🇪", group: "O", rating: 74 },
  { code: "NOR", name: "Norway", namePt: "Noruega", flag: "🇳🇴", group: "O", rating: 73 },

  // ── Group P ──
  { code: "UKR", name: "Ukraine", namePt: "Ucrânia", flag: "🇺🇦", group: "P", rating: 72 },
  { code: "NZL", name: "New Zealand", namePt: "Nova Zelândia", flag: "🇳🇿", group: "P", rating: 61 },
  { code: "IRQ", name: "Iraq", namePt: "Iraque", flag: "🇮🇶", group: "P", rating: 63 },
];

/** Quick lookup helper: get a team by 3-letter code */
export function getTeam(code: string): Team | undefined {
  return teams.find((t) => t.code === code);
}

/** All teams grouped by their group letter */
export function groups(): Map<string, Team[]> {
  const map = new Map<string, Team[]>();
  for (const t of teams) {
    const g = map.get(t.group) ?? [];
    g.push(t);
    map.set(t.group, g);
  }
  return map;
}
