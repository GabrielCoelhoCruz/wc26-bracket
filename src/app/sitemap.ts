import type { MetadataRoute } from "next"

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://wc26-bracket.vercel.app"

const routes = ["/", "/bracket", "/draft", "/ranking", "/bolao"] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "daily",
    priority: path === "/" ? 1 : 0.8,
  }))
}
