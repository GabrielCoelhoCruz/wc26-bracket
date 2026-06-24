import type { MetadataRoute } from "next"

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://wc26-bracket.vercel.app"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
