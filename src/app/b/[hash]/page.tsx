import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decodeBracketToken, buildShareUrl } from "@/lib/share-token";
import SharedBracketView from "./SharedBracketView";

interface BracketPageProps {
  params: Promise<{ hash: string }>;
}

export async function generateMetadata({
  params,
}: BracketPageProps): Promise<Metadata> {
  const { hash } = await params;
  const payload = await decodeBracketToken(hash);

  const title = payload?.ownerName
    ? `${payload.ownerName} montou o bracket da Copa 2026`
    : "Bracket da Copa 2026";
  const description = payload
    ? "Dá uma olhada no bracket e manda o seu. ⚽🏆"
    : "Link inválido ou expirado.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: buildShareUrl(hash),
      siteName: "WC26 Bracket + Draft",
      images: [
        {
          url: `/api/og?hash=${encodeURIComponent(hash)}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?hash=${encodeURIComponent(hash)}`],
    },
  };
}

export default async function BracketHashPage({ params }: BracketPageProps) {
  const { hash } = await params;
  const payload = await decodeBracketToken(hash);

  if (!payload) {
    notFound();
  }

  return (
    <SharedBracketView
      hash={hash}
      predictions={payload.predictions}
      ownerName={payload.ownerName}
    />
  );
}
