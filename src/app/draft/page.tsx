"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { matches as defaultMatches } from "@/data/matches";
import { getQualifiedTeamCount } from "@/data/players";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { CampaignBracketPreview } from "@/components/campaign/CampaignBracketPreview";
import { CampaignMatchView } from "@/components/campaign/CampaignMatchView";
import { CampaignResultCard } from "@/components/campaign/CampaignResultCard";
import { CampaignSetup } from "@/components/campaign/CampaignSetup";
import { NationDraftBoard } from "@/components/campaign/NationDraftBoard";
import {
  countR32ResolvedTeams,
  isR32Ready,
} from "@/lib/campaign-path";
import {
  beginNationDraft,
  clearCampaign,
  createCampaignSetup,
  finishDraftAndPrepareCampaign,
  loadCampaign,
  saveCampaign,
  simulateAllRemaining,
  simulateCurrentMatch,
  startPlaying,
  type NationDraftState,
} from "@/lib/campaign-sim";
import {
  pickNationPlayer,
  rerollNation,
} from "@/lib/draft-nation-roll";
import { applyGroupScoresToMatches, fetchMergedResults } from "@/lib/match-results";
import type { FormationId } from "@/lib/formations";
import type { CampaignState, DraftMode, Match, PlayStyle, Player } from "@/types/wc26";
import PageSkeleton from "@/components/ui/PageSkeleton";

const STORAGE_KEY_SCORES = "wc26-group-scores";

const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function loadGroupScores(): Record<string, { homeScore: number; awayScore: number; finished: boolean }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCORES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function DraftCampaignInner() {
  const { t, format } = useLanguage();
  const [campaign, setCampaign] = useState<CampaignState | null>(() => loadCampaign());
  const [draft, setDraft] = useState<NationDraftState | null>(null);
  const [resultMatches, setResultMatches] = useState<Match[]>([...defaultMatches]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  const [formation, setFormation] = useState<FormationId>("4-3-3");
  const [playStyle, setPlayStyle] = useState<PlayStyle>("balanced");
  const [draftMode, setDraftMode] = useState<DraftMode>("classic");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const groupScores = loadGroupScores();
      const { matches } = await fetchMergedResults();
      if (!cancelled) {
        setResultMatches(applyGroupScoresToMatches(matches, groupScores));
        setLoadingMatches(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const liveMatches = useMemo(
    () => resultMatches,
    [resultMatches],
  );

  const r32Count = useMemo(() => countR32ResolvedTeams(liveMatches), [liveMatches]);
  const r32Ready = useMemo(() => isR32Ready(liveMatches), [liveMatches]);

  useEffect(() => {
    if (campaign) saveCampaign(campaign);
  }, [campaign]);

  const phase = campaign?.phase ?? "setup";

  function handleStartDraft() {
    clearCampaign();
    const setup = createCampaignSetup(formation, playStyle, draftMode);
    const { campaign: next, draft: d } = beginNationDraft(setup);
    setCampaign(next);
    setDraft(d);
  }

  function handlePick(player: Player) {
    if (!draft || !campaign) return;
    const nextDraft = pickNationPlayer(draft, player.id);
    setDraft(nextDraft);
    if (nextDraft.completed) {
      const prepared = finishDraftAndPrepareCampaign(
        { ...campaign, draftRounds: nextDraft.draftRounds },
        nextDraft,
        liveMatches,
      );
      setCampaign(prepared);
      setDraft(null);
    }
  }

  function handleReroll() {
    if (!draft) return;
    setDraft(rerollNation(draft));
  }

  function handleStartCampaign() {
    if (!campaign) return;
    setCampaign(startPlaying(campaign));
  }

  function handleSimulateOne() {
    if (!campaign) return;
    setCampaign(simulateCurrentMatch(campaign));
  }

  function handleSimulateAll() {
    if (!campaign) return;
    setCampaign(simulateAllRemaining(campaign));
  }

  function handleRestart() {
    clearCampaign();
    setCampaign(null);
    setDraft(null);
  }

  if (loadingMatches) {
    return <PageSkeleton lines={7} />;
  }

  return (
    <div
      className={`flex flex-1 flex-col items-center px-0 py-8 sm:py-12 ${
        phase === "drafting" ? "w-full" : ""
      }`}
    >
      <div
        className={
          phase === "drafting" && draft
            ? "w-full"
            : "w-full max-w-4xl px-4"
        }
      >
        {phase !== "drafting" && (
          <>
            <p className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-accent">
              {t.draft.accent}
            </p>

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-black sm:text-4xl">{t.draft.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {format(t.draft.subtitle, { count: getQualifiedTeamCount() })}
              </p>
            </div>
          </>
        )}

        {phase === "setup" && !draft && (
          <CampaignSetup
            formation={formation}
            playStyle={playStyle}
            draftMode={draftMode}
            r32Ready={r32Ready}
            r32Count={r32Count}
            onFormationChange={setFormation}
            onPlayStyleChange={setPlayStyle}
            onDraftModeChange={setDraftMode}
            onStart={handleStartDraft}
          />
        )}

        {phase === "drafting" && draft && campaign && (
          <NationDraftBoard
            draft={draft}
            draftMode={campaign.draftMode}
            onPick={handlePick}
            onReroll={handleReroll}
          />
        )}

        {phase === "ready" && campaign && (
          <CampaignBracketPreview campaign={campaign} onStart={handleStartCampaign} />
        )}

        {phase === "playing" && campaign && (
          <CampaignMatchView
            campaign={campaign}
            onSimulateOne={handleSimulateOne}
            onSimulateAll={handleSimulateAll}
          />
        )}

        {phase === "finished" && campaign && (
          <CampaignResultCard campaign={campaign} onRestart={handleRestart} />
        )}

        {(phase !== "setup" || draft) && phase !== "finished" && (
          <div className={`flex justify-center ${phase === "drafting" ? "mt-4 px-4" : "mt-8"}`}>
            <button
              type="button"
              onClick={handleRestart}
              className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            >
              {t.common.cancelCampaign}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DraftPage() {
  const isClient = useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);
  const { t } = useLanguage();
  if (!isClient) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-muted-foreground">
        {t.common.loading}
      </div>
    );
  }
  return <DraftCampaignInner />;
}
