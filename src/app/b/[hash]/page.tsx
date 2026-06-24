import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decodeBracketToken, buildShareUrl } from "@/lib/share-token";
import { getTeam } from "@/data/teams";
import {
  buildOgImagePath,
  getShareOgContent,
  getTeamName,
  openGraphLocale,
  parseShareLangParam,
  type Locale,
} from "@/lib/i18n";
import SharedBracketView from "./SharedBracketView";

interface BracketPageProps {
  params: Promise<{ hash: string }>;
  searchParams: Promise<{ lang?: string }>;
}

function buildShareMetadata(hash: string, locale: Locale, valid: boolean, payload: Awaited<ReturnType<typeof decodeBracketToken>>) {
  const champion = payload?.predictions["final"]?.winner;
  const champTeam = champion ? getTeam(champion) : null;
  const og = getShareOgContent(
    {
      ownerName: payload?.ownerName,
      predictionCount: payload ? Object.keys(payload.predictions).length : 0,
      championName: champTeam
        ? getTeamName(champTeam, locale)
        : champion,
      valid,
    },
    locale,
  );

  return {
    title: og.title,
    description: og.description,
    openGraph: {
      title: og.title,
      description: og.description,
      url: buildShareUrl(hash, locale),
      siteName: "WC26 Bracket + Draft",
      images: [
        {
          url: buildOgImagePath(hash, locale),
          width: 1200,
          height: 630,
          alt: og.title,
        },
      ],
      type: "website" as const,
      locale: openGraphLocale(locale),
    },
    twitter: {
      card: "summary_large_image" as const,
      title: og.title,
      description: og.description,
      images: [buildOgImagePath(hash, locale)],
    },
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: BracketPageProps): Promise<Metadata> {
  const { hash } = await params;
  const { lang } = await searchParams;
  const locale = parseShareLangParam(lang ?? null);
  const payload = await decodeBracketToken(hash);

  return buildShareMetadata(hash, locale, !!payload, payload);
}

export default async function BracketHashPage({
  params,
  searchParams,
}: BracketPageProps) {
  const { hash } = await params;
  const { lang } = await searchParams;
  const localeFromUrl = lang ? parseShareLangParam(lang) : undefined;
  const payload = await decodeBracketToken(hash);

  if (!payload) {
    notFound();
  }

  return (
    <SharedBracketView
      hash={hash}
      predictions={payload.predictions}
      ownerName={payload.ownerName}
      syncLocale={localeFromUrl}
    />
  );
}
