"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { FORMATION_LIST } from "@/lib/formations";
import { getFormationDescription } from "@/lib/i18n";
import type { DraftMode, PlayStyle } from "@/types/wc26";
import type { FormationId } from "@/lib/formations";
import { Dices } from "lucide-react";

const PLAY_STYLE_IDS: PlayStyle[] = ["defensive", "balanced", "offensive"];
const DRAFT_MODE_IDS: DraftMode[] = ["classic", "almanaque"];

interface CampaignSetupProps {
  formation: FormationId;
  playStyle: PlayStyle;
  draftMode: DraftMode;
  r32Ready: boolean;
  r32Count: number;
  onFormationChange: (f: FormationId) => void;
  onPlayStyleChange: (s: PlayStyle) => void;
  onDraftModeChange: (m: DraftMode) => void;
  onStart: () => void;
}

export function CampaignSetup({
  formation,
  playStyle,
  draftMode,
  r32Ready,
  r32Count,
  onFormationChange,
  onPlayStyleChange,
  onDraftModeChange,
  onStart,
}: CampaignSetupProps) {
  const { t, format, locale } = useLanguage();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      {!r32Ready && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-foreground">
          <p className="font-semibold">{t.draft.bracketIncomplete}</p>
          <p className="mt-1 text-muted-foreground">
            {format(t.draft.bracketIncompleteBody, { count: r32Count })}
          </p>
        </div>
      )}

      <section>
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t.draft.formation}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {FORMATION_LIST.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFormationChange(f.id)}
              className={`rounded-xl border p-4 text-left transition ${
                formation === f.id
                  ? "border-accent bg-accent/10 shadow-lg"
                  : "border-border bg-card/60 hover:border-accent/40"
              }`}
            >
              <div className="text-lg font-black">{f.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {getFormationDescription(f.id, locale)}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t.draft.playStyle}
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLAY_STYLE_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onPlayStyleChange(id)}
              className={`rounded-xl border p-3 text-left transition ${
                playStyle === id
                  ? "border-accent bg-accent/10"
                  : "border-border bg-card/60 hover:border-accent/40"
              }`}
            >
              <div className="text-sm font-bold">{t.draft.playStyles[id]}</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {t.draft.playStyles[`${id}Desc` as keyof typeof t.draft.playStyles]}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t.draft.draftMode}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {DRAFT_MODE_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onDraftModeChange(id)}
              className={`rounded-xl border p-4 text-left transition ${
                draftMode === id
                  ? "border-accent bg-accent/10"
                  : "border-border bg-card/60 hover:border-accent/40"
              }`}
            >
              <div className="text-sm font-bold">{t.draft.draftModes[id]}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t.draft.draftModes[`${id}Desc` as keyof typeof t.draft.draftModes]}
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-2 rounded-lg bg-pitch px-8 py-3 text-sm font-black text-white transition hover:brightness-110"
        >
          <Dices size={16} /> {t.common.rollAndStart}
        </button>
      </div>
    </div>
  );
}
