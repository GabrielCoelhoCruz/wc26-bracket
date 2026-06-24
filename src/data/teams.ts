import type { Team } from "@/types/wc26";

/**
 * 48 teams — FIFA World Cup 2026 (Groups A–L)
 * Synced from https://worldcup26.ir — 2026-06-24
 */
export const teams: readonly Team[] = [
  { code: "CZE", name: "Czech Republic", namePt: "República Tcheca", nameFa: "جمهوری چک", flag: "🇨🇿", flagUrl: "https://flagcdn.com/w80/cz.png", iso2: "CZ", apiId: "4", group: "A", rating: 76 },
  { code: "MEX", name: "Mexico", namePt: "México", nameFa: "مکزیک", flag: "🇲🇽", flagUrl: "https://flagcdn.com/w80/mx.png", iso2: "MX", apiId: "1", group: "A", rating: 79 },
  { code: "RSA", name: "South Africa", namePt: "África do Sul", nameFa: "آفریقای جنوبی", flag: "🇿🇦", flagUrl: "https://flagcdn.com/w80/za.png", iso2: "ZA", apiId: "2", group: "A", rating: 72 },
  { code: "KOR", name: "South Korea", namePt: "Coreia do Sul", nameFa: "کره جنوبی", flag: "🇰🇷", flagUrl: "https://flagcdn.com/w80/kr.png", iso2: "KR", apiId: "3", group: "A", rating: 78 },
  { code: "BIH", name: "Bosnia and Herzegovina", namePt: "Bósnia e Herzegovina", nameFa: "بوسنی و هرزگوین", flag: "🇧🇦", flagUrl: "https://flagcdn.com/w80/ba.png", iso2: "BA", apiId: "6", group: "B", rating: 72 },
  { code: "CAN", name: "Canada", namePt: "Canadá", nameFa: "کانادا", flag: "🇨🇦", flagUrl: "https://flagcdn.com/w80/ca.png", iso2: "CA", apiId: "5", group: "B", rating: 76 },
  { code: "QAT", name: "Qatar", namePt: "Catar", nameFa: "قطر", flag: "🇶🇦", flagUrl: "https://flagcdn.com/w80/qa.png", iso2: "QA", apiId: "7", group: "B", rating: 68 },
  { code: "SUI", name: "Switzerland", namePt: "Suíça", nameFa: "سوئیس", flag: "🇨🇭", flagUrl: "https://flagcdn.com/w80/ch.png", iso2: "CH", apiId: "8", group: "B", rating: 80 },
  { code: "BRA", name: "Brazil", namePt: "Brasil", nameFa: "برزیل", flag: "🇧🇷", flagUrl: "https://flagcdn.com/w80/br.png", iso2: "BR", apiId: "9", group: "C", rating: 93 },
  { code: "HAI", name: "Haiti", namePt: "Haiti", nameFa: "هائیتی", flag: "🇭🇹", flagUrl: "https://flagcdn.com/w80/ht.png", iso2: "HT", apiId: "11", group: "C", rating: 65 },
  { code: "MAR", name: "Morocco", namePt: "Marrocos", nameFa: "مراکش", flag: "🇲🇦", flagUrl: "https://flagcdn.com/w80/ma.png", iso2: "MA", apiId: "10", group: "C", rating: 82 },
  { code: "SCO", name: "Scotland", namePt: "Escócia", nameFa: "اسکاتلند", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", flagUrl: "https://flagcdn.com/w80/gb-sct.png", iso2: "SCO", apiId: "12", group: "C", rating: 77 },
  { code: "AUS", name: "Australia", namePt: "Austrália", nameFa: "استرالیا", flag: "🇦🇺", flagUrl: "https://flagcdn.com/w80/au.png", iso2: "AU", apiId: "15", group: "D", rating: 75 },
  { code: "PAR", name: "Paraguay", namePt: "Paraguai", nameFa: "پاراگوئه", flag: "🇵🇾", flagUrl: "https://flagcdn.com/w80/py.png", iso2: "PY", apiId: "14", group: "D", rating: 74 },
  { code: "TUR", name: "Turkey", namePt: "Turquia", nameFa: "ترکیه", flag: "🇹🇷", flagUrl: "https://flagcdn.com/w80/tr.png", iso2: "TR", apiId: "16", group: "D", rating: 78 },
  { code: "USA", name: "United States", namePt: "Estados Unidos", nameFa: "آمریکا", flag: "🇺🇸", flagUrl: "https://flagcdn.com/w80/us.png", iso2: "US", apiId: "13", group: "D", rating: 80 },
  { code: "CUW", name: "Curaçao", namePt: "Curaçao", nameFa: "کوراسائو", flag: "🇨🇼", flagUrl: "https://flagcdn.com/w80/cw.png", iso2: "CW", apiId: "18", group: "E", rating: 68 },
  { code: "ECU", name: "Ecuador", namePt: "Equador", nameFa: "اکوادور", flag: "🇪🇨", flagUrl: "https://flagcdn.com/w80/ec.png", iso2: "EC", apiId: "20", group: "E", rating: 76 },
  { code: "GER", name: "Germany", namePt: "Alemanha", nameFa: "آلمان", flag: "🇩🇪", flagUrl: "https://flagcdn.com/w80/de.png", iso2: "DE", apiId: "17", group: "E", rating: 88 },
  { code: "CIV", name: "Ivory Coast", namePt: "Costa do Marfim", nameFa: "ساحل عاج", flag: "🇨🇮", flagUrl: "https://flagcdn.com/w80/ci.png", iso2: "CI", apiId: "19", group: "E", rating: 77 },
  { code: "JPN", name: "Japan", namePt: "Japão", nameFa: "ژاپن", flag: "🇯🇵", flagUrl: "https://flagcdn.com/w80/jp.png", iso2: "JP", apiId: "22", group: "F", rating: 82 },
  { code: "NED", name: "Netherlands", namePt: "Países Baixos", nameFa: "هلند", flag: "🇳🇱", flagUrl: "https://flagcdn.com/w80/nl.png", iso2: "NL", apiId: "21", group: "F", rating: 86 },
  { code: "SWE", name: "Sweden", namePt: "Suécia", nameFa: "سوئد", flag: "🇸🇪", flagUrl: "https://flagcdn.com/w80/se.png", iso2: "SE", apiId: "23", group: "F", rating: 79 },
  { code: "TUN", name: "Tunisia", namePt: "Tunísia", nameFa: "تونس", flag: "🇹🇳", flagUrl: "https://flagcdn.com/w80/tn.png", iso2: "TN", apiId: "24", group: "F", rating: 73 },
  { code: "BEL", name: "Belgium", namePt: "Bélgica", nameFa: "بلژیک", flag: "🇧🇪", flagUrl: "https://flagcdn.com/w80/be.png", iso2: "BE", apiId: "25", group: "G", rating: 84 },
  { code: "EGY", name: "Egypt", namePt: "Egito", nameFa: "مصر", flag: "🇪🇬", flagUrl: "https://flagcdn.com/w80/eg.png", iso2: "EG", apiId: "26", group: "G", rating: 74 },
  { code: "IRN", name: "Iran", namePt: "Irã", nameFa: "ایران", flag: "🇮🇷", flagUrl: "https://flagcdn.com/w80/ir.png", iso2: "IR", apiId: "27", group: "G", rating: 75 },
  { code: "NZL", name: "New Zealand", namePt: "Nova Zelândia", nameFa: "نیوزیلند", flag: "🇳🇿", flagUrl: "https://flagcdn.com/w80/nz.png", iso2: "NZ", apiId: "28", group: "G", rating: 68 },
  { code: "CPV", name: "Cape Verde", namePt: "Cabo Verde", nameFa: "کیپ ورد", flag: "🇨🇻", flagUrl: "https://flagcdn.com/w80/cv.png", iso2: "CV", apiId: "30", group: "H", rating: 70 },
  { code: "KSA", name: "Saudi Arabia", namePt: "Arábia Saudita", nameFa: "عربستان", flag: "🇸🇦", flagUrl: "https://flagcdn.com/w80/sa.png", iso2: "SA", apiId: "31", group: "H", rating: 74 },
  { code: "ESP", name: "Spain", namePt: "Espanha", nameFa: "اسپانیا", flag: "🇪🇸", flagUrl: "https://flagcdn.com/w80/es.png", iso2: "ES", apiId: "29", group: "H", rating: 89 },
  { code: "URU", name: "Uruguay", namePt: "Uruguai", nameFa: "اروگوئه", flag: "🇺🇾", flagUrl: "https://flagcdn.com/w80/uy.png", iso2: "UY", apiId: "32", group: "H", rating: 83 },
  { code: "FRA", name: "France", namePt: "França", nameFa: "فرانسه", flag: "🇫🇷", flagUrl: "https://flagcdn.com/w80/fr.png", iso2: "FR", apiId: "33", group: "I", rating: 91 },
  { code: "IRQ", name: "Iraq", namePt: "Iraque", nameFa: "عراق", flag: "🇮🇶", flagUrl: "https://flagcdn.com/w80/iq.png", iso2: "IQ", apiId: "35", group: "I", rating: 72 },
  { code: "NOR", name: "Norway", namePt: "Noruega", nameFa: "نروژ", flag: "🇳🇴", flagUrl: "https://flagcdn.com/w80/no.png", iso2: "NO", apiId: "36", group: "I", rating: 80 },
  { code: "SEN", name: "Senegal", namePt: "Senegal", nameFa: "سنگال", flag: "🇸🇳", flagUrl: "https://flagcdn.com/w80/sn.png", iso2: "SN", apiId: "34", group: "I", rating: 78 },
  { code: "ALG", name: "Algeria", namePt: "Argélia", nameFa: "الجزایر", flag: "🇩🇿", flagUrl: "https://flagcdn.com/w80/dz.png", iso2: "DZ", apiId: "38", group: "J", rating: 76 },
  { code: "ARG", name: "Argentina", namePt: "Argentina", nameFa: "آرژانتین", flag: "🇦🇷", flagUrl: "https://flagcdn.com/w80/ar.png", iso2: "AR", apiId: "37", group: "J", rating: 94 },
  { code: "AUT", name: "Austria", namePt: "Áustria", nameFa: "اتریش", flag: "🇦🇹", flagUrl: "https://flagcdn.com/w80/at.png", iso2: "AT", apiId: "39", group: "J", rating: 79 },
  { code: "JOR", name: "Jordan", namePt: "Jordânia", nameFa: "اردن", flag: "🇯🇴", flagUrl: "https://flagcdn.com/w80/jo.png", iso2: "JO", apiId: "40", group: "J", rating: 72 },
  { code: "COL", name: "Colombia", namePt: "Colômbia", nameFa: "کلمبیا", flag: "🇨🇴", flagUrl: "https://flagcdn.com/w80/co.png", iso2: "CO", apiId: "44", group: "K", rating: 81 },
  { code: "COD", name: "Democratic Republic of the Congo", namePt: "RD Congo", nameFa: "جمهوری دموکراتیک کنگو", flag: "🇨🇩", flagUrl: "https://flagcdn.com/w80/cd.png", iso2: "CD", apiId: "42", group: "K", rating: 73 },
  { code: "POR", name: "Portugal", namePt: "Portugal", nameFa: "پرتغال", flag: "🇵🇹", flagUrl: "https://flagcdn.com/w80/pt.png", iso2: "PT", apiId: "41", group: "K", rating: 87 },
  { code: "UZB", name: "Uzbekistan", namePt: "Uzbequistão", nameFa: "ازبکستان", flag: "🇺🇿", flagUrl: "https://flagcdn.com/w80/uz.png", iso2: "UZ", apiId: "43", group: "K", rating: 71 },
  { code: "CRO", name: "Croatia", namePt: "Croácia", nameFa: "کرواسی", flag: "🇭🇷", flagUrl: "https://flagcdn.com/w80/hr.png", iso2: "HR", apiId: "46", group: "L", rating: 82 },
  { code: "ENG", name: "England", namePt: "Inglaterra", nameFa: "انگلستان", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", flagUrl: "https://flagcdn.com/w80/gb-eng.png", iso2: "ENG", apiId: "45", group: "L", rating: 90 },
  { code: "GHA", name: "Ghana", namePt: "Gana", nameFa: "غنا", flag: "🇬🇭", flagUrl: "https://flagcdn.com/w80/gh.png", iso2: "GH", apiId: "47", group: "L", rating: 74 },
  { code: "PAN", name: "Panama", namePt: "Panamá", nameFa: "پاناما", flag: "🇵🇦", flagUrl: "https://flagcdn.com/w80/pa.png", iso2: "PA", apiId: "48", group: "L", rating: 70 },
];

let catalogTeams: readonly Team[] | null = null;

/** Hydrate client-side team lookups from /api/teams (Supabase overlay). */
export function setTeamCatalog(merged: Team[]): void {
  catalogTeams = merged;
}

export function getAllTeams(): readonly Team[] {
  return catalogTeams ?? teams;
}

/** Quick lookup helper: get a team by 3-letter code */
export function getTeam(code: string): Team | undefined {
  return getAllTeams().find((t) => t.code === code);
}

/** All teams grouped by their group letter */
export function groups(): Map<string, Team[]> {
  const map = new Map<string, Team[]>();
  for (const t of getAllTeams()) {
    const g = map.get(t.group) ?? [];
    g.push(t);
    map.set(t.group, g);
  }
  return map;
}
