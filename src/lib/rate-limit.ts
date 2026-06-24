/**
 * Simple in-memory sliding-window rate limiter for Edge middleware.
 * Per-isolate only — combine with Vercel Firewall for fleet-wide protection.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const buckets = new Map<string, RateLimitEntry>()

export interface RateLimitOptions {
  key: string
  limit: number
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetMs: number
}

export function rateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const entry = buckets.get(key)

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1, resetMs: windowMs }
  }

  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetMs: Math.max(0, entry.resetAt - now),
    }
  }

  entry.count += 1
  return {
    success: true,
    remaining: limit - entry.count,
    resetMs: Math.max(0, entry.resetAt - now),
  }
}
