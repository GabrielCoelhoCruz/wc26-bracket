import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimit } from "@/lib/rate-limit"

const API_WINDOW_MS = 60_000
const API_LIMIT = 120
const SHARE_POST_LIMIT = 10

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  )
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isSharePost =
    path === "/api/share" && request.method === "POST"
  const limit = isSharePost ? SHARE_POST_LIMIT : API_LIMIT
  const bucket = isSharePost ? "share-post" : "api"

  const result = rateLimit({
    key: `${getClientIp(request)}:${bucket}`,
    limit,
    windowMs: API_WINDOW_MS,
  })

  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(result.resetMs / 1000)),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
        },
      },
    )
  }

  const response = NextResponse.next()
  response.headers.set("X-RateLimit-Limit", String(limit))
  response.headers.set("X-RateLimit-Remaining", String(result.remaining))
  return response
}

export const config = {
  matcher: "/api/:path*",
}
