import type { Team } from "@/types/wc26"

export type Locale = "pt-BR" | "en-US"

export const locales: readonly Locale[] = ["pt-BR", "en-US"] as const
export const defaultLocale: Locale = "pt-BR"
export const localeStorageKey = "wc26-locale"

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

export function getTeamName(team: Team | null | undefined, locale: Locale): string {
  if (!team) return ""
  return locale === "pt-BR" ? team.namePt : team.name
}

export function formatLocaleDate(
  dateKey: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions,
): string {
  const d = new Date(`${dateKey}T12:00:00`)
  return d.toLocaleDateString(locale, options)
}

export function formatLocaleTime(date: Date, locale: Locale): string {
  return date.toLocaleTimeString(locale)
}

export function formatMatchDateTime(
  dateKey: string,
  locale: Locale,
  time?: string,
): string {
  const day = formatLocaleDate(dateKey, locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
  return time ? `${day} · ${time}` : day
}

export function formatShortMatchDate(
  dateKey: string,
  locale: Locale,
  time?: string,
): string {
  const day = formatLocaleDate(dateKey, locale, {
    day: "2-digit",
    month: "short",
  })
  return time ? `${day} · ${time}` : day
}

type DeepString<T> = {
  [K in keyof T]: T[K] extends object ? DeepString<T[K]> : string
}

export type Messages = DeepString<typeof messagesPt>

const messagesPt = {
  nav: {
    home: "Home",
    bracket: "Bracket",
    draft: "Draft",
    ranking: "Ranking",
    bolao: "Bolão",
    openMenu: "Abrir menu de navegação",
  },
  common: {
    loading: "Carregando...",
    loadingBracket: "Carregando bracket...",
    loadingBolao: "Carregando bolão...",
    close: "Fechar",
    closeMessage: "Fechar mensagem",
    vs: "vs",
    you: "Você",
    friend: "Amigo",
    live: "Ao vivo",
    liveShort: "Ao vivo",
    syncing: "sincronizando...",
    updating: "atualizando...",
    source: "Fonte",
    sourceApi: "worldcup26.ir + local",
    sourceLocal: "dados locais",
    sourceLocalTitle: "Dados locais",
    pts: "pts",
    points: "pontos",
    predictions: "palpite(s)",
    prediction: "palpite",
    champion: "Campeão",
    championPick: "Campeão",
    group: "Grupo",
    match: "jogo",
    matches: "jogos",
    all: "Todos",
    today: "Hoje",
    yesterday: "Ontem",
    tomorrow: "Amanhã",
    details: "Detalhes",
    result: "Resultado",
    tbd: "A definir",
    thirdBest: "3º Melhor",
    winner: "Vencedor",
    predictionLabel: "Palpite",
    predictionShort: "Palp.",
    homeScore: "Placar mandante",
    awayScore: "Placar visitante",
    predictedHome: "Placar previsto mandante",
    predictedAway: "Placar previsto visitante",
    scoreboard: "Placar: {home} {homeScore} a {awayScore} {away}",
    flagAlt: "Bandeira {name}",
    imported: "importado",
    participants: "participante(s)",
    optional: "opcional",
    copy: "Copiar",
    copied: "Copiado!",
    importing: "Importando...",
    sharing: "Compartilhando...",
    simulating: "Simulando...",
    refreshing: "Atualizando...",
    updatedAt: "atualizado",
    lastResults: "Últimos resultados",
    upcoming: "próximos",
    finished: "encerrados",
    liveCount: "ao vivo",
    complete: "Completo",
    games: "jogos",
    noGamesFilter: "Nenhum jogo neste filtro.",
    noGamesDay: "Nenhum jogo neste dia com o filtro atual.",
    noMatchesPhase: "Nenhuma partida nesta fase ainda.",
    noneYet: "Nenhum participante ainda.",
    view: "Ver",
    remove: "Remover",
    entry: "Entrada",
    penalties: "Pênaltis",
    inProgress: "Em andamento",
    scheduled: "Agendado",
    scheduledShort: "Ag.",
    finishedShort: "Enc.",
    finishedLabel: "Encerrado",
    markFinished: "Marcar realizado",
    predictionBadge: "Palpite",
    tree: "Árvore",
    byPhase: "Por fase",
    byGroup: "Por grupo",
    byDay: "Por dia",
    viewMode: "Modo de visualização",
    knockoutPhases: "Fases do mata-mata",
    howItWorks: "Como funciona?",
    upcomingGames: "Próximos jogos",
    bracket: "Bracket",
    hits: "acerto(s)",
    standings: "Classificação",
    team: "Time",
    ptsShort: "Pts",
    played: "J",
    won: "V",
    drawn: "E",
    lost: "D",
    gf: "GP",
    ga: "GC",
    gd: "SG",
    first: "1º",
    second: "2º",
    thisWeek: "Esta semana",
    matchDay: "Dia de jogo",
    todayAtCup: "Hoje na Copa",
    prevDay: "Dia anterior",
    nextDay: "Próximo dia",
    viewCalendar: "Ver calendário",
    opponent: "Adversário",
    previousGames: "Jogos anteriores",
    gameOf: "Jogo {current} de {total}",
    yourXi: "Seu XI",
    partialRating: "Rating parcial",
    roundTime: "Tempo da rodada",
    round: "Rodada",
    openPosition: "Posição aberta",
    rolledSquad: "Elenco sorteado",
    fullSquad: "Elenco completo",
    pickForPosition: "Escolha p/ {position}",
    squadPlayers: "jogadores",
    inFullSquad: "no elenco",
    bench: "Reservas",
    availableFor: "disponíveis para",
    roleGk: "Goleiros",
    roleDef: "Defesa",
    roleMid: "Meio-campo",
    roleFwd: "Ataque",
    boxScore: "Placar do XI",
    attack: "Ataque",
    defense: "Defesa",
    overall: "Geral",
    positionShort: "Pos",
    player: "Jogador",
    tapPositionHint: "Escolha um jogador da lista para a posição aberta",
    tapSlotUndo: "Toque na vaga preenchida para desfazer a última escolha",
    autofillRound: "Escolher melhor jogador",
    autofillRemaining: "Completar automaticamente",
    playerAvailable: "jogador disponível nesta seleção",
    playersAvailable: "jogadores disponíveis nesta seleção",
    noPlayerPosition: "Ninguém nesta posição no elenco — sorteie outra seleção.",
    cancelCampaign: "Cancelar campanha",
    newCampaign: "Nova campanha",
    copyResult: "Copiar resultado",
    xiReady: "XI pronto!",
    yourKnockoutRoute: "Sua rota no mata-mata",
    xiRating: "Rating do seu XI",
    startCampaign: "Iniciar campanha",
    goToBracket: "Ir para o Bracket",
    simulateGame: "Simular este jogo",
    simulateAll: "Simular até o fim",
    rollAndStart: "Rolar dado e iniciar draft",
    rerollNation: "Sortear outra seleção",
    rollingNation: "Sorteando...",
    nationRolled: "Seleção sorteada · Copa 2026",
    pickFromNation: "Escolha um jogador desta seleção para a posição aberta",
    liveDraft: "Draft ao vivo",
    bracketPreview: "Prévia do bracket",
    disagreements: "Onde vocês discordam",
    addFriendLink: "Adicionar amigo via link",
    importViaLink: "Importar via link",
    addToBolao: "Adicionar ao bolão",
    enterWithBracket: "Entrar com meu bracket",
    addMyBracket: "Adicionar meu bracket",
    recalcPoints: "Recalcular pontos",
    importBracket: "Importar bracket",
    makeMyBracket: "Fazer meu bracket",
    copyLink: "Copiar link",
    linkCopied: "Link copiado!",
    copyLinkText: "Copiar link + texto",
    textCopied: "Texto copiado!",
    shareBracket: "Compartilhar bracket",
    resetAll: "Resetar tudo",
    refreshResults: "Atualizar resultados",
    simulateGroups: "Simular grupos",
    buildXiSimulate: "Montar XI e simular mata-mata",
    groupsTab: "Fase de Grupos",
    knockoutTab: "Mata-Mata",
    yourName: "Seu nome",
    yourNameShare: "Seu nome (para compartilhar)",
    pasteLink: "Cole o link ou hash do bracket",
    participantName: "Nome do participante (opcional)",
    linkOrHash: "Link ou hash do bracket",
    nameOptional: "Nome (opcional)",
    themeLight: "Ativar tema claro",
    themeDark: "Ativar tema escuro",
    languagePt: "Mudar para português",
    languageEn: "Mudar para inglês",
    languageLabel: "Idioma",
    pitchAria: "Campo de futebol com formação {formation}",
    emptySlotAria: "Posição {position} vaga",
    playerSlotAria: "{name}, {position}, {rating} OVR",
  },
  home: {
    tagline: "Copa dos Sonhos · 2026",
    subtitle: "Monte seu bracket. Monte seu XI. Desafie seus amigos.",
    bracketCta: "BRACKET",
    draftCta: "DRAFT",
    liveBadge: "Ao vivo",
    stepPredict: "Palpitar",
    stepPredictDesc: "Preencha seu bracket da Copa",
    stepDraft: "Draft",
    stepDraftDesc: "Monte seu XI e dispute o mata-mata",
    stepCompete: "Competir",
    stepCompeteDesc: "Compartilhe e compare no ranking",
  },
  footer: {
    built: "WC26 — feito para a Copa do Mundo FIFA 2026",
    madeIn: "Feito no Brasil",
  },
  bracket: {
    title: "Bracket do Mata-Mata",
    accent: "Copa do Mundo 2026",
    groupsCompleted: "grupos concluídos",
    allCleared: "Tudo limpo — resultados e palpites resetados",
    groupsSimulated: "Resultados dos grupos simulados com base nos ratings!",
    resultsUpdated: "Resultados atualizados via worldcup26.ir",
    usingLocal: "Usando dados locais (API indisponível)",
    shareCopied: "Link copiado! Compartilhe com seus amigos.",
    shareError: "Erro ao compartilhar. Tente novamente.",
    shareFail: "Falha ao criar link",
    upcomingKnockout: "Próximos jogos do mata-mata",
    groupsInfo:
      "Classificação calculada automaticamente a partir dos resultados da API e dos placares inseridos manualmente. Navegue por grupo ou dia da competição.",
    groupsInfoGroup: "grupo",
    groupsInfoDay: "dia",
    groupGames: "Jogos do Grupo {group}",
    howToBody:
      "Clique no time que você acha que vai vencer cada partida. Insira os placares nos campos abaixo de cada jogo. Times são preenchidos automaticamente com base nos resultados dos grupos.",
    howToScoring: "+1 pt por vencedor certo · +3 pt por placar exato.",
    championHere: "Seu palpite aparece aqui",
    r32Labels: {
      first: "1º {group}",
      second: "2º {group}",
    },
  },
  stages: {
    group: "Grupos",
    round_of_32: "32 avos",
    round_of_16: "16 avos",
    quarter_final: "Quartas",
    semi_final: "Semi",
    third_place: "3º lugar",
    final: "Final",
    r32: "32 Avos",
    r16: "16 Avos",
    qf: "Quartas",
    sf: "Semi",
    fin: "FIN",
    r32Long: "32 Avos de Final",
    r16Long: "Oitavas de Final",
    qfLong: "Quartas de Final",
    sfLong: "Semifinal",
  },
  filters: {
    all: "Todos",
    live: "Ao vivo",
    upcoming: "Próximos",
    finished: "Encerrados",
  },
  draft: {
    accent: "Campanha Draft",
    title: "Monte Seu XI · Dispute o Mata-Mata",
    subtitle:
      "Estilo 7a0: role o dado, escolha jogadores das {count} seleções WC26 e simule do R32 à final usando o bracket atual.",
    formation: "Formação",
    playStyle: "Estilo de jogo",
    draftMode: "Modo de draft",
    bracketIncomplete: "Bracket incompleto para o mata-mata",
    bracketIncompleteBody:
      "{count}/32 vagas do R32 definidas. Preencha os resultados dos grupos no bracket para liberar a campanha completa. Você ainda pode montar o XI.",
    playStyles: {
      defensive: "Defensivo",
      defensiveDesc: "Mais solidez atrás, menos gols",
      balanced: "Equilibrado",
      balancedDesc: "Meio-termo entre ataque e defesa",
      offensive: "Ofensivo",
      offensiveDesc: "Mais pressão e chances de gol",
    },
    draftModes: {
      classic: "Clássico",
      classicDesc: "Mostra OVR · até 3 rerolls por rodada",
      almanaque: "Almanaque",
      almanaqueDesc: "OVR oculto · 1 reroll por rodada",
    },
    xiReadyBody:
      "Preencha os resultados dos grupos no bracket para definir os confrontos do R32.",
    routeSubtitle:
      "{count} jogos do R32 à final · adversários do seu bracket atual",
    yourXiVs: "Seu XI vs",
    champion: "Você levantou a taça!",
    eliminated: "Eliminado no mata-mata",
    championBody: "Campanha perfeita em {count} jogos.",
    eliminatedBody: "Caiu na {stage}.",
    shareChampion: "🏆 Campeão WC26 Draft!",
    shareEnded: "⚽ Campanha WC26 Draft encerrada",
    shareFormation: "Formação",
    shareXi: "XI",
    shareBuild: "Monte o seu em {url}/draft",
    sharePen: "(pên.)",
    formations: {
      "4-3-3": "Ataque com pontas abertos",
      "4-4-2": "Dois atacantes e meio equilibrado",
      "3-5-2": "Três zagueiros e alas ofensivas",
      "4-2-3-1": "Meia armador e dois volantes",
    },
    resultCard: {
      badge: "WC26 Draft",
      myXi: "Meu XI WC26 ({formation}) — {rating} OVR",
      simulatedScore: "Placar simulado",
      simulatedScoreLine: "Placar simulado: {home}–{away}",
      footer: "Monte seu time em {url}/draft",
      copy: "Copiar texto do card",
    },
  },
  positions: {
    GK: "Goleiro",
    RB: "Lateral Direito",
    CB: "Zagueiro",
    LB: "Lateral Esquerdo",
    DM: "Volante",
    CM: "Meio-campista",
    AM: "Meia Ofensivo",
    RW: "Ponta Direita",
    LW: "Ponta Esquerda",
    ST: "Centroavante",
  },
  positionAbbrevs: {
    GK: "GOL",
    RB: "LD",
    CB: "ZAG",
    LB: "LE",
    DM: "VOL",
    CM: "MC",
    AM: "MEI",
    RW: "PD",
    LW: "PE",
    ST: "CA",
  },
  sim: {
    goals: " Gols: {list}.",
    penalties: "{score} no tempo normal. {rating} OVR vence nos pênaltis.{goals}",
    draw: "{home} × {away} empatou {score}.{goals}",
    win: "{rating} OVR venceu por {score}.{goals}",
  },
  ranking: {
    accent: "Ranking",
    title: "Leaderboard Local",
    subtitle: "Ranking salvo neste navegador. Importe brackets via link compartilhado.",
    addFirst: "Monte seu bracket em /bracket antes de adicionar ao ranking.",
    added: "Seu bracket foi adicionado ao ranking local.",
    imported: "Bracket importado com sucesso!",
    importFail: "Não foi possível importar. Verifique o link.",
    empty: "Nenhum participante ainda. Compartilhe seu bracket ou importe links de amigos.",
    winners: "vencedores",
    exactScores: "placares exatos",
  },
  bolao: {
    accent: "Bolão",
    compare: "Compare palpites localmente",
    addFirst: "Monte seu bracket em /bracket primeiro.",
    joined: "Seu bracket entrou no bolão!",
    added: "Participante adicionado ao bolão!",
    importFail: "Link inválido. Verifique e tente novamente.",
    defaultName: "Meu Bolão WC26",
    matchLabels: {
      final: "Final",
      "third-place": "3º Lugar",
      "sf-1": "Semi 1",
      "sf-2": "Semi 2",
      "qf-1": "Quartas 1",
      "qf-2": "Quartas 2",
      "qf-3": "Quartas 3",
      "qf-4": "Quartas 4",
    },
  },
  share: {
    accent: "Copa 2026",
    title: "Bracket compartilhado",
    titleOwner: "{name} montou o bracket",
    subtitle: "{count} palpites",
    subtitleChampion: " · Campeão: {flag} {name}",
    finalPrediction: "Palpite da final · campeão: {name}",
    importRanking: "Importe no",
    or: "ou",
    noPredictions: "Esse bracket ainda não tem palpites.",
    shareText: "{who}montou o bracket da Copa 2026. 🏆⚽\n\nDá uma olhada e manda o seu:",
  },
  metadata: {
    title: "WC26 Bracket + Draft",
    description:
      "Monte seu bracket. Monte seu XI. Desafie seus amigos. - WC26 Bracket + Draft para a Copa 2026",
    appleTitle: "WC26",
  },
  og: {
    siteTitle: "WC26 Bracket + Draft",
    titleOwner: "{name} montou o bracket da Copa 2026",
    titleDefault: "Bracket da Copa 2026",
    championPick: "Palpite de campeã: {name}",
    predictionsKnockout: "{count} palpites no mata-mata",
    footer: "wc26.app · Monte o seu bracket e desafie seus amigos",
    invalidDescription: "Link inválido ou expirado.",
    shareDescription: "Dá uma olhada no bracket e manda o seu. ⚽🏆",
  },
  pages: {
    error: {
      badge: "Erro",
      title: "Algo deu errado",
      body: "Ocorreu um erro inesperado. Tente recarregar a página.",
      retry: "Tentar novamente",
    },
    notFound: {
      badge: "404",
      title: "Fora de jogo",
      body: "Esta página não existe ou o link de bracket expirou.",
      home: "Voltar ao início",
    },
  },
} as const

const messagesEn: Messages = {
  nav: {
    home: "Home",
    bracket: "Bracket",
    draft: "Draft",
    ranking: "Ranking",
    bolao: "Pool",
    openMenu: "Open navigation menu",
  },
  common: {
    loading: "Loading...",
    loadingBracket: "Loading bracket...",
    loadingBolao: "Loading pool...",
    close: "Close",
    closeMessage: "Close message",
    vs: "vs",
    you: "You",
    friend: "Friend",
    live: "Live",
    liveShort: "Live",
    syncing: "syncing...",
    updating: "updating...",
    source: "Source",
    sourceApi: "worldcup26.ir + local",
    sourceLocal: "local data",
    sourceLocalTitle: "Local data",
    pts: "pts",
    points: "points",
    predictions: "prediction(s)",
    prediction: "prediction",
    champion: "Champion",
    championPick: "Champion",
    group: "Group",
    match: "match",
    matches: "matches",
    all: "All",
    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
    details: "Details",
    result: "Result",
    tbd: "TBD",
    thirdBest: "3rd Best",
    winner: "Winner",
    predictionLabel: "Pick",
    predictionShort: "Pick",
    homeScore: "Home score",
    awayScore: "Away score",
    predictedHome: "Predicted home score",
    predictedAway: "Predicted away score",
    scoreboard: "Score: {home} {homeScore} to {awayScore} {away}",
    flagAlt: "{name} flag",
    imported: "imported",
    participants: "participant(s)",
    optional: "optional",
    copy: "Copy",
    copied: "Copied!",
    importing: "Importing...",
    sharing: "Sharing...",
    simulating: "Simulating...",
    refreshing: "Refreshing...",
    updatedAt: "updated",
    lastResults: "Latest results",
    upcoming: "upcoming",
    finished: "finished",
    liveCount: "live",
    complete: "Complete",
    games: "games",
    noGamesFilter: "No matches in this filter.",
    noGamesDay: "No matches on this day with the current filter.",
    noMatchesPhase: "No matches in this phase yet.",
    noneYet: "No participants yet.",
    view: "View",
    remove: "Remove",
    entry: "Entry",
    penalties: "Penalties",
    inProgress: "In progress",
    scheduled: "Scheduled",
    scheduledShort: "Sch.",
    finishedShort: "FT",
    finishedLabel: "Finished",
    markFinished: "Mark as played",
    predictionBadge: "Pick",
    tree: "Tree",
    byPhase: "By phase",
    byGroup: "By group",
    byDay: "By day",
    viewMode: "View mode",
    knockoutPhases: "Knockout phases",
    howItWorks: "How does it work?",
    upcomingGames: "Upcoming matches",
    bracket: "Bracket",
    hits: "hit(s)",
    standings: "Standings",
    team: "Team",
    ptsShort: "Pts",
    played: "P",
    won: "W",
    drawn: "D",
    lost: "L",
    gf: "GF",
    ga: "GA",
    gd: "GD",
    first: "1st",
    second: "2nd",
    thisWeek: "This week",
    matchDay: "Match day",
    todayAtCup: "Today at the World Cup",
    prevDay: "Previous day",
    nextDay: "Next day",
    viewCalendar: "View calendar",
    opponent: "Opponent",
    previousGames: "Previous matches",
    gameOf: "Match {current} of {total}",
    yourXi: "Your XI",
    partialRating: "Partial rating",
    roundTime: "Round timer",
    round: "Round",
    openPosition: "Open position",
    rolledSquad: "Rolled squad",
    fullSquad: "Full squad",
    pickForPosition: "Pick for {position}",
    squadPlayers: "players",
    inFullSquad: "in squad",
    bench: "Bench",
    availableFor: "available for",
    roleGk: "Goalkeepers",
    roleDef: "Defence",
    roleMid: "Midfield",
    roleFwd: "Attack",
    boxScore: "Lineup score",
    attack: "Attack",
    defense: "Defense",
    overall: "Overall",
    positionShort: "Pos",
    player: "Player",
    tapPositionHint: "Pick a player from the squad list for the open slot",
    tapSlotUndo: "Tap a filled slot to undo your last pick",
    autofillRound: "Pick best player",
    autofillRemaining: "Autofill lineup",
    playerAvailable: "player available from this nation",
    playersAvailable: "players available from this nation",
    noPlayerPosition: "No player in this position — reroll another nation.",
    cancelCampaign: "Cancel campaign",
    newCampaign: "New campaign",
    copyResult: "Copy result",
    xiReady: "XI ready!",
    yourKnockoutRoute: "Your knockout route",
    xiRating: "Your XI rating",
    startCampaign: "Start campaign",
    goToBracket: "Go to Bracket",
    simulateGame: "Simulate this match",
    simulateAll: "Simulate to the end",
    rollAndStart: "Roll dice and start draft",
    rerollNation: "Reroll nation",
    rollingNation: "Rolling...",
    nationRolled: "Nation rolled · World Cup 2026",
    pickFromNation: "Pick a player from this nation for the open position",
    liveDraft: "Live draft",
    bracketPreview: "Bracket preview",
    disagreements: "Where you disagree",
    addFriendLink: "Add friend via link",
    importViaLink: "Import via link",
    addToBolao: "Add to pool",
    enterWithBracket: "Enter with my bracket",
    addMyBracket: "Add my bracket",
    recalcPoints: "Recalculate points",
    importBracket: "Import bracket",
    makeMyBracket: "Make my bracket",
    copyLink: "Copy link",
    linkCopied: "Link copied!",
    copyLinkText: "Copy link + text",
    textCopied: "Text copied!",
    shareBracket: "Share bracket",
    resetAll: "Reset all",
    refreshResults: "Refresh results",
    simulateGroups: "Simulate groups",
    buildXiSimulate: "Build XI and simulate knockout",
    groupsTab: "Group Stage",
    knockoutTab: "Knockout",
    yourName: "Your name",
    yourNameShare: "Your name (for sharing)",
    pasteLink: "Paste bracket link or hash",
    participantName: "Participant name (optional)",
    linkOrHash: "Bracket link or hash",
    nameOptional: "Name (optional)",
    themeLight: "Switch to light theme",
    themeDark: "Switch to dark theme",
    languagePt: "Switch to Portuguese",
    languageEn: "Switch to English",
    languageLabel: "Language",
    pitchAria: "Football pitch with formation {formation}",
    emptySlotAria: "Empty {position} slot",
    playerSlotAria: "{name}, {position}, {rating} OVR",
  },
  home: {
    tagline: "Dream World Cup · 2026",
    subtitle: "Build your bracket. Build your XI. Challenge your friends.",
    bracketCta: "BRACKET",
    draftCta: "DRAFT",
    liveBadge: "Live",
    stepPredict: "Predict",
    stepPredictDesc: "Fill your bracket",
    stepDraft: "Draft",
    stepDraftDesc: "Build your XI and play the knockout",
    stepCompete: "Compete",
    stepCompeteDesc: "Share and rank",
  },
  footer: {
    built: "WC26 - built for the 2026 FIFA World Cup",
    madeIn: "Made in Brazil",
  },
  bracket: {
    title: "Knockout Bracket",
    accent: "FIFA World Cup 2026",
    groupsCompleted: "groups completed",
    allCleared: "All cleared — results and picks reset",
    groupsSimulated: "Group results simulated based on ratings!",
    resultsUpdated: "Results updated via worldcup26.ir",
    usingLocal: "Using local data (API unavailable)",
    shareCopied: "Link copied! Share with your friends.",
    shareError: "Error sharing. Please try again.",
    shareFail: "Failed to create link",
    upcomingKnockout: "Upcoming knockout matches",
    groupsInfo:
      "Standings are calculated automatically from API results and manually entered scores. Browse by group or match day.",
    groupsInfoGroup: "group",
    groupsInfoDay: "day",
    groupGames: "Group {group} matches",
    howToBody:
      "Click the team you think will win each match. Enter predicted scores below each game. Teams are filled automatically from group results.",
    howToScoring: "+1 pt per correct winner · +3 pt per exact score.",
    championHere: "Your pick appears here",
    r32Labels: {
      first: "1st {group}",
      second: "2nd {group}",
    },
  },
  stages: {
    group: "Groups",
    round_of_32: "Round of 32",
    round_of_16: "Round of 16",
    quarter_final: "Quarter-finals",
    semi_final: "Semi-final",
    third_place: "3rd place",
    final: "Final",
    r32: "Round of 32",
    r16: "Round of 16",
    qf: "Quarters",
    sf: "Semi",
    fin: "FIN",
    r32Long: "Round of 32",
    r16Long: "Round of 16",
    qfLong: "Quarter-finals",
    sfLong: "Semi-final",
  },
  filters: {
    all: "All",
    live: "Live",
    upcoming: "Upcoming",
    finished: "Finished",
  },
  draft: {
    accent: "Draft Campaign",
    title: "Build Your XI · Play the Knockout",
    subtitle:
      "7a0 style: roll the dice, pick players from {count} WC26 nations, and simulate from R32 to the final using your current bracket.",
    formation: "Formation",
    playStyle: "Play style",
    draftMode: "Draft mode",
    bracketIncomplete: "Bracket incomplete for knockout",
    bracketIncompleteBody:
      "{count}/32 R32 slots defined. Fill group results in the bracket to unlock the full campaign. You can still build your XI.",
    playStyles: {
      defensive: "Defensive",
      defensiveDesc: "More solidity at the back, fewer goals",
      balanced: "Balanced",
      balancedDesc: "Middle ground between attack and defense",
      offensive: "Offensive",
      offensiveDesc: "More pressure and goal chances",
    },
    draftModes: {
      classic: "Classic",
      classicDesc: "Shows OVR · up to 3 rerolls per round",
      almanaque: "Almanac",
      almanaqueDesc: "Hidden OVR · 1 reroll per round",
    },
    xiReadyBody: "Fill group results in the bracket to define R32 matchups.",
    routeSubtitle: "{count} matches from R32 to the final · opponents from your current bracket",
    yourXiVs: "Your XI vs",
    champion: "You lifted the trophy!",
    eliminated: "Eliminated in the knockout",
    championBody: "Perfect run in {count} matches.",
    eliminatedBody: "Eliminated in the {stage}.",
    shareChampion: "🏆 WC26 Draft Champion!",
    shareEnded: "⚽ WC26 Draft campaign ended",
    shareFormation: "Formation",
    shareXi: "XI",
    shareBuild: "Build yours at {url}/draft",
    sharePen: "(pen.)",
    formations: {
      "4-3-3": "Attack with wide wingers",
      "4-4-2": "Two strikers and a balanced midfield",
      "3-5-2": "Three center-backs and attacking wing-backs",
      "4-2-3-1": "Playmaker with two holding mids",
    },
    resultCard: {
      badge: "WC26 Draft",
      myXi: "My WC26 XI ({formation}) — {rating} OVR",
      simulatedScore: "Simulated score",
      simulatedScoreLine: "Simulated score: {home}–{away}",
      footer: "Build your team at {url}/draft",
      copy: "Copy card text",
    },
  },
  positions: {
    GK: "Goalkeeper",
    RB: "Right Back",
    CB: "Center Back",
    LB: "Left Back",
    DM: "Defensive Mid",
    CM: "Central Mid",
    AM: "Attacking Mid",
    RW: "Right Winger",
    LW: "Left Winger",
    ST: "Striker",
  },
  positionAbbrevs: {
    GK: "GK",
    RB: "RB",
    CB: "CB",
    LB: "LB",
    DM: "DM",
    CM: "CM",
    AM: "AM",
    RW: "RW",
    LW: "LW",
    ST: "ST",
  },
  sim: {
    goals: " Goals: {list}.",
    penalties: "{score} after full time. {rating} OVR wins on penalties.{goals}",
    draw: "{home} × {away} drew {score}.{goals}",
    win: "{rating} OVR won {score}.{goals}",
  },
  ranking: {
    accent: "Ranking",
    title: "Local Leaderboard",
    subtitle: "Ranking saved in this browser. Import brackets via shared link.",
    addFirst: "Build your bracket at /bracket before adding to the ranking.",
    added: "Your bracket was added to the local ranking.",
    imported: "Bracket imported successfully!",
    importFail: "Could not import. Check the link.",
    empty: "No participants yet. Share your bracket or import friends' links.",
    winners: "winners",
    exactScores: "exact scores",
  },
  bolao: {
    accent: "Pool",
    compare: "Compare picks locally",
    addFirst: "Build your bracket at /bracket first.",
    joined: "Your bracket joined the pool!",
    added: "Participant added to the pool!",
    importFail: "Invalid link. Check and try again.",
    defaultName: "My WC26 Pool",
    matchLabels: {
      final: "Final",
      "third-place": "3rd Place",
      "sf-1": "Semi 1",
      "sf-2": "Semi 2",
      "qf-1": "QF 1",
      "qf-2": "QF 2",
      "qf-3": "QF 3",
      "qf-4": "QF 4",
    },
  },
  share: {
    accent: "World Cup 2026",
    title: "Shared bracket",
    titleOwner: "{name} built the bracket",
    subtitle: "{count} picks",
    subtitleChampion: " · Champion: {flag} {name}",
    finalPrediction: "Final pick · champion: {name}",
    importRanking: "Import in",
    or: "or",
    noPredictions: "This bracket has no picks yet.",
    shareText: "{who}built the 2026 World Cup bracket. 🏆⚽\n\nCheck it out and send yours:",
  },
  metadata: {
    title: "WC26 Bracket + Draft",
    description:
      "Build your bracket. Build your XI. Challenge your friends. - WC26 Bracket + Draft for World Cup 2026",
    appleTitle: "WC26",
  },
  og: {
    siteTitle: "WC26 Bracket + Draft",
    titleOwner: "{name} built the 2026 World Cup bracket",
    titleDefault: "2026 World Cup Bracket",
    championPick: "Champion pick: {name}",
    predictionsKnockout: "{count} knockout picks",
    footer: "wc26.app · Build your bracket and challenge your friends",
    invalidDescription: "Invalid or expired link.",
    shareDescription: "Check out this bracket and send yours. ⚽🏆",
  },
  pages: {
    error: {
      badge: "Error",
      title: "Something went wrong",
      body: "An unexpected error occurred. Try reloading the page.",
      retry: "Try again",
    },
    notFound: {
      badge: "404",
      title: "Offside",
      body: "This page does not exist or the bracket link is invalid.",
      home: "Back home",
    },
  },
}

export const messages: Record<Locale, Messages> = {
  "pt-BR": messagesPt,
  "en-US": messagesEn,
}

export function getMessages(locale: Locale): Messages {
  return messages[locale]
}

/** Simple template replace: "Hello {name}" + { name: "World" } */
export function formatMessage(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(vars[key] ?? `{${key}}`),
  )
}

export function getStageLabel(
  stage: keyof Messages["stages"],
  locale: Locale,
): string {
  const m = getMessages(locale)
  return m.stages[stage] ?? stage
}

export function getMatchStageLabel(
  stage: string,
  locale: Locale,
): string {
  const m = getMessages(locale).stages
  const map: Record<string, string> = {
    group: m.group,
    round_of_32: m.round_of_32,
    round_of_16: m.round_of_16,
    quarter_final: m.quarter_final,
    semi_final: m.semi_final,
    third_place: m.third_place,
    final: m.final,
  }
  return map[stage] ?? stage
}

export function getCampaignStageLabel(matchId: string, locale: Locale): string {
  const m = getMessages(locale).stages
  const map: Record<string, string> = {
    r32: m.r32Long,
    r16: m.r16Long,
    qf: m.qfLong,
    sf: m.sfLong,
    final: m.final,
  }
  const prefix = matchId.split("-")[0] ?? matchId
  return map[prefix] ?? matchId
}

export function getPositionLabel(
  position: keyof Messages["positions"],
  locale: Locale,
): string {
  const labels = getMessages(locale).positions
  return labels[position] ?? position
}

export function getPositionAbbrev(
  position: keyof Messages["positions"],
  locale: Locale,
): string {
  const abbrevs = getMessages(locale).positionAbbrevs
  return abbrevs[position] ?? position
}

export function getFormationDescription(
  formationId: keyof Messages["draft"]["formations"],
  locale: Locale,
): string {
  return getMessages(locale).draft.formations[formationId] ?? formationId
}

export function formatPoolMatchLabel(matchId: string, locale: Locale): string {
  const labels = getMessages(locale).bolao.matchLabels as Record<string, string>
  return labels[matchId] ?? matchId.toUpperCase()
}

export function parseShareLangParam(value: string | null | undefined): Locale {
  if (!value) return defaultLocale
  if (value === "en" || value === "en-US") return "en-US"
  if (value === "pt" || value === "pt-BR") return "pt-BR"
  return defaultLocale
}

export function appendShareLangParam(url: string, locale: Locale): string {
  if (locale !== "en-US") return url
  return url.includes("?") ? `${url}&lang=en` : `${url}?lang=en`
}

export function buildOgImagePath(hash: string, locale: Locale): string {
  const base = `/api/og?hash=${encodeURIComponent(hash)}`
  return locale === "en-US" ? `${base}&lang=en` : base
}

export interface ShareOgInput {
  ownerName?: string
  predictionCount: number
  championName?: string
  valid: boolean
}

export interface ShareOgContent {
  title: string
  description: string
  imageSubtitle: string
  footer: string
}

export function getShareOgContent(
  input: ShareOgInput,
  locale: Locale,
): ShareOgContent {
  const og = getMessages(locale).og

  if (!input.valid) {
    return {
      title: og.titleDefault,
      description: og.invalidDescription,
      imageSubtitle: og.invalidDescription,
      footer: og.footer,
    }
  }

  const title = input.ownerName
    ? formatMessage(og.titleOwner, { name: input.ownerName })
    : og.siteTitle

  const imageSubtitle = input.championName
    ? formatMessage(og.championPick, { name: input.championName })
    : formatMessage(og.predictionsKnockout, { count: input.predictionCount })

  return {
    title,
    description: og.shareDescription,
    imageSubtitle,
    footer: og.footer,
  }
}

export function openGraphLocale(locale: Locale): string {
  return locale === "en-US" ? "en_US" : "pt_BR"
}
