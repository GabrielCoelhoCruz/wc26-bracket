// ---------------------------------------------------------------------------
// WC26 – Campaign Simulation Orchestrator
// ---------------------------------------------------------------------------

import {
  buildCampaignMatches,
  isR32Ready,
  loadBracketTree,
  pickEntryMatch,
} from "@/lib/campaign-path";
import {
  buildTeamFromNationDraft,
  startNationDraft,
  type NationDraftState,
} from "@/lib/draft-nation-roll";
import { matchNarrative, simulateMatch, userWonMatch } from "@/lib/draft-sim";
import type { Locale } from "@/lib/i18n";
import type { FormationId } from "@/lib/formations";
import type {
  CampaignMatch,
  CampaignOutcome,
  CampaignState,
  DraftMode,
  Match,
  PlayStyle,
  SimulatedMatchResult,
} from "@/types/wc26";

export const CAMPAIGN_STORAGE_KEY = "wc26-campaign-state";

function makeSeed(): number {
  return Math.floor(Math.random() * 1e9);
}

export function createCampaignSetup(
  formation: FormationId,
  playStyle: PlayStyle,
  draftMode: DraftMode,
  seed?: number,
): CampaignState {
  const s = seed ?? makeSeed();
  return {
    phase: "setup",
    formation,
    playStyle,
    draftMode,
    draftRounds: [],
    userSlot: "home",
    pathMatchIds: [],
    matches: [],
    currentMatchIndex: 0,
    seed: s,
  };
}

export function beginNationDraft(state: CampaignState): {
  campaign: CampaignState;
  draft: NationDraftState;
} {
  const draft = startNationDraft(
    state.formation as FormationId,
    state.draftMode,
    state.seed,
  );
  return {
    campaign: { ...state, phase: "drafting", nationDraft: draft },
    draft,
  };
}

export function finishDraftAndPrepareCampaign(
  campaign: CampaignState,
  draft: NationDraftState,
  sourceMatches: readonly Match[],
): CampaignState {
  const userTeam = buildTeamFromNationDraft(draft);
  const tree = loadBracketTree(sourceMatches);

  if (!isR32Ready(sourceMatches)) {
    return {
      ...campaign,
      phase: "ready",
      draftRounds: draft.draftRounds,
      nationDraft: null,
      userTeam,
      matches: [],
      pathMatchIds: [],
      entryMatchId: undefined,
    };
  }

  const entry = pickEntryMatch(tree, campaign.seed);
  if (!entry) {
    return {
      ...campaign,
      phase: "ready",
      draftRounds: draft.draftRounds,
      nationDraft: null,
      userTeam,
      matches: [],
      pathMatchIds: [],
    };
  }

  const pathMatchIds = buildCampaignMatches(
    tree,
    userTeam,
    entry.matchId,
    entry.userSlot,
    campaign.formation as FormationId,
    campaign.playStyle,
    campaign.seed,
  ).map((m) => m.matchId);

  const matches = buildCampaignMatches(
    tree,
    userTeam,
    entry.matchId,
    entry.userSlot,
    campaign.formation as FormationId,
    campaign.playStyle,
    campaign.seed,
  );

  return {
    ...campaign,
    phase: "ready",
    draftRounds: draft.draftRounds,
    nationDraft: null,
    userTeam,
    entryMatchId: entry.matchId,
    userSlot: entry.userSlot,
    pathMatchIds,
    matches,
    currentMatchIndex: 0,
  };
}

export function startPlaying(campaign: CampaignState): CampaignState {
  if (campaign.matches.length === 0) return campaign;
  return { ...campaign, phase: "playing", currentMatchIndex: 0 };
}

function toResult(sim: ReturnType<typeof simulateMatch>): SimulatedMatchResult {
  return {
    homeScore: sim.homeScore,
    awayScore: sim.awayScore,
    result: sim.result,
    penaltyWinner: sim.penaltyWinner,
    events: sim.events,
    wentToPenalties: sim.wentToPenalties,
  };
}

export function simulateCurrentMatch(campaign: CampaignState): CampaignState {
  const idx = campaign.currentMatchIndex;
  const match = campaign.matches[idx];
  if (!match || campaign.phase !== "playing") return campaign;

  const sim = simulateMatch(match.home, match.away, {
    playStyle: campaign.playStyle,
    userPlayStyle: campaign.playStyle,
    seed: campaign.seed + idx * 997,
  });

  const result = toResult(sim);
  const won = userWonMatch(sim, match.userSlot);
  const newMatches = campaign.matches.map((m, i) =>
    i === idx ? { ...m, result } : m,
  );

  if (!won) {
    return {
      ...campaign,
      matches: newMatches,
      phase: "finished",
      outcome: "eliminated" as CampaignOutcome,
    };
  }

  const nextIndex = idx + 1;
  if (nextIndex >= newMatches.length) {
    return {
      ...campaign,
      matches: newMatches,
      currentMatchIndex: nextIndex,
      phase: "finished",
      outcome: "champion" as CampaignOutcome,
    };
  }

  return {
    ...campaign,
    matches: newMatches,
    currentMatchIndex: nextIndex,
  };
}

export function simulateAllRemaining(campaign: CampaignState): CampaignState {
  let state = campaign;
  while (state.phase === "playing" && state.currentMatchIndex < state.matches.length) {
    state = simulateCurrentMatch(state);
  }
  return state;
}

export function getCurrentMatch(campaign: CampaignState): CampaignMatch | null {
  return campaign.matches[campaign.currentMatchIndex] ?? null;
}

export function getMatchNarrativeForCampaign(
  match: CampaignMatch,
  locale: Locale = "pt-BR",
): string {
  if (!match.result) return "";
  const sim = {
    ...match.result,
    home: match.home,
    away: match.away,
    homeAttack: 0,
    awayAttack: 0,
    homeDefense: 0,
    awayDefense: 0,
  };
  return matchNarrative(sim, locale);
}

export function loadCampaign(): CampaignState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CampaignState;
  } catch {
    return null;
  }
}

export function saveCampaign(state: CampaignState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function clearCampaign(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CAMPAIGN_STORAGE_KEY);
}

export function syncDraftRoundsToCampaign(
  campaign: CampaignState,
  draft: NationDraftState,
): CampaignState {
  return {
    ...campaign,
    nationDraft: draft.completed ? null : draft,
    draftRounds: draft.draftRounds,
    userTeam: draft.completed ? buildTeamFromNationDraft(draft) : campaign.userTeam,
  };
}

export type { NationDraftState };
