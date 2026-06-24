// ---------------------------------------------------------------------------
// WC26 – Local metadata for teams from worldcup26.ir API
// Portuguese names, emoji flags, and draft ratings (not provided by API)
// ---------------------------------------------------------------------------

export interface TeamMeta {
  namePt: string
  flag: string
  rating: number
}

/** ISO2 / FIFA code → display metadata */
export const TEAM_META: Record<string, TeamMeta> = {
  MEX: { namePt: "México", flag: "🇲🇽", rating: 79 },
  RSA: { namePt: "África do Sul", flag: "🇿🇦", rating: 72 },
  KOR: { namePt: "Coreia do Sul", flag: "🇰🇷", rating: 78 },
  CZE: { namePt: "República Tcheca", flag: "🇨🇿", rating: 76 },
  CAN: { namePt: "Canadá", flag: "🇨🇦", rating: 76 },
  BIH: { namePt: "Bósnia e Herzegovina", flag: "🇧🇦", rating: 72 },
  QAT: { namePt: "Catar", flag: "🇶🇦", rating: 68 },
  SUI: { namePt: "Suíça", flag: "🇨🇭", rating: 80 },
  BRA: { namePt: "Brasil", flag: "🇧🇷", rating: 93 },
  MAR: { namePt: "Marrocos", flag: "🇲🇦", rating: 82 },
  HAI: { namePt: "Haiti", flag: "🇭🇹", rating: 65 },
  SCO: { namePt: "Escócia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", rating: 77 },
  USA: { namePt: "Estados Unidos", flag: "🇺🇸", rating: 80 },
  PAR: { namePt: "Paraguai", flag: "🇵🇾", rating: 74 },
  AUS: { namePt: "Austrália", flag: "🇦🇺", rating: 75 },
  TUR: { namePt: "Turquia", flag: "🇹🇷", rating: 78 },
  GER: { namePt: "Alemanha", flag: "🇩🇪", rating: 88 },
  CUW: { namePt: "Curaçao", flag: "🇨🇼", rating: 68 },
  CIV: { namePt: "Costa do Marfim", flag: "🇨🇮", rating: 77 },
  ECU: { namePt: "Equador", flag: "🇪🇨", rating: 76 },
  NED: { namePt: "Países Baixos", flag: "🇳🇱", rating: 86 },
  JPN: { namePt: "Japão", flag: "🇯🇵", rating: 82 },
  SWE: { namePt: "Suécia", flag: "🇸🇪", rating: 79 },
  TUN: { namePt: "Tunísia", flag: "🇹🇳", rating: 73 },
  BEL: { namePt: "Bélgica", flag: "🇧🇪", rating: 84 },
  EGY: { namePt: "Egito", flag: "🇪🇬", rating: 74 },
  IRN: { namePt: "Irã", flag: "🇮🇷", rating: 75 },
  NZL: { namePt: "Nova Zelândia", flag: "🇳🇿", rating: 68 },
  ESP: { namePt: "Espanha", flag: "🇪🇸", rating: 89 },
  CPV: { namePt: "Cabo Verde", flag: "🇨🇻", rating: 70 },
  KSA: { namePt: "Arábia Saudita", flag: "🇸🇦", rating: 74 },
  URU: { namePt: "Uruguai", flag: "🇺🇾", rating: 83 },
  FRA: { namePt: "França", flag: "🇫🇷", rating: 91 },
  SEN: { namePt: "Senegal", flag: "🇸🇳", rating: 78 },
  IRQ: { namePt: "Iraque", flag: "🇮🇶", rating: 72 },
  NOR: { namePt: "Noruega", flag: "🇳🇴", rating: 80 },
  ARG: { namePt: "Argentina", flag: "🇦🇷", rating: 94 },
  ALG: { namePt: "Argélia", flag: "🇩🇿", rating: 76 },
  AUT: { namePt: "Áustria", flag: "🇦🇹", rating: 79 },
  JOR: { namePt: "Jordânia", flag: "🇯🇴", rating: 72 },
  POR: { namePt: "Portugal", flag: "🇵🇹", rating: 87 },
  COD: { namePt: "RD Congo", flag: "🇨🇩", rating: 73 },
  UZB: { namePt: "Uzbequistão", flag: "🇺🇿", rating: 71 },
  COL: { namePt: "Colômbia", flag: "🇨🇴", rating: 81 },
  ENG: { namePt: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", rating: 90 },
  CRO: { namePt: "Croácia", flag: "🇭🇷", rating: 82 },
  GHA: { namePt: "Gana", flag: "🇬🇭", rating: 74 },
  PAN: { namePt: "Panamá", flag: "🇵🇦", rating: 70 },
}

export function getTeamMeta(fifaCode: string): TeamMeta {
  const meta = TEAM_META[fifaCode.toUpperCase()]
  if (meta) return meta
  return { namePt: fifaCode, flag: "🏳️", rating: 70 }
}
