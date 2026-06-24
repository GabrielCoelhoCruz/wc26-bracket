"use client"

import { Zap } from "lucide-react"
import { useLanguage } from "@/components/i18n/LanguageProvider"
import StadiumButton from "@/components/ui/StadiumButton"
import StadiumSection from "@/components/ui/StadiumSection"
import PitchCard from "@/components/ui/PitchCard"

export default function Home() {
  const { t } = useLanguage()

  const steps = [
    {
      title: t.home.stepPredict,
      description: t.home.stepPredictDesc,
      glow: false,
    },
    {
      title: t.home.stepDraft,
      description: t.home.stepDraftDesc,
      glow: true,
    },
    {
      title: t.home.stepCompete,
      description: t.home.stepCompeteDesc,
      glow: false,
    },
  ]

  return (
    <StadiumSection className="flex min-h-[100dvh] flex-col items-center justify-center text-center">
      <p className="mb-6 text-sm font-bold uppercase tracking-[0.3em] text-gold">
        {t.home.tagline}
      </p>

      <h1 className="font-scoreboard mb-4 text-7xl font-black leading-none tracking-tighter text-foreground md:text-9xl">
        WC<span className="text-grass">26</span>
      </h1>

      <p className="mb-12 max-w-md text-lg text-muted-foreground md:text-xl">
        {t.home.subtitle}
      </p>

      <div className="mb-24 flex flex-col gap-4 sm:flex-row">
        <StadiumButton href="/bracket" size="lg">
          {t.home.bracketCta}
          <span aria-hidden>→</span>
        </StadiumButton>
        <StadiumButton href="/draft" variant="secondary" size="lg" className="relative">
          {t.home.draftCta}
          <span className="inline-flex items-center justify-center rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
            <Zap size={10} className="mr-0.5" aria-hidden />
            {t.home.liveBadge}
          </span>
        </StadiumButton>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((step) => (
          <PitchCard key={step.title} glow={step.glow} className="p-6 text-center">
            <h3 className="font-scoreboard text-xl font-bold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
          </PitchCard>
        ))}
      </div>
    </StadiumSection>
  )
}
