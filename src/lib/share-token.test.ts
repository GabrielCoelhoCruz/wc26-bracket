import { afterEach, describe, expect, it, vi } from "vitest"
import {
  buildShareUrl,
  decodeBracketToken,
  encodeBracketToken,
  normalizeShareHash,
  ShareSecretMissingError,
} from "@/lib/share-token"

const ORIGINAL_SECRET = process.env.BRACKET_SHARE_SECRET
const ORIGINAL_NODE_ENV = process.env.NODE_ENV

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) {
    delete process.env.BRACKET_SHARE_SECRET
  } else {
    process.env.BRACKET_SHARE_SECRET = ORIGINAL_SECRET
  }
  vi.stubEnv("NODE_ENV", ORIGINAL_NODE_ENV ?? "test")
})

describe("share-token", () => {
  it("normalizes pasted URLs and query strings", () => {
    expect(normalizeShareHash("https://example.com/b/abc123?lang=pt")).toBe("abc123")
    expect(normalizeShareHash("abc123#frag")).toBe("abc123")
  })

  it("round-trips predictions with a secret", async () => {
    process.env.BRACKET_SHARE_SECRET = "test-secret-roundtrip"

    const token = await encodeBracketToken({
      predictions: { final: { winner: "BRA" } },
      ownerName: "Loira",
    })

    const decoded = await decodeBracketToken(token)
    expect(decoded?.ownerName).toBe("Loira")
    expect(decoded?.predictions.final?.winner).toBe("BRA")
  })

  it("rejects tampered tokens when a secret is set", async () => {
    process.env.BRACKET_SHARE_SECRET = "test-secret-for-vitest"

    const token = await encodeBracketToken({
      predictions: { final: { winner: "ARG" } },
    })

    const tampered = `${token}x`
    const decoded = await decodeBracketToken(tampered)
    expect(decoded).toBeNull()
  })

  it("fails closed in production when secret is missing", async () => {
    vi.stubEnv("NODE_ENV", "production")
    delete process.env.BRACKET_SHARE_SECRET

    await expect(
      encodeBracketToken({ predictions: { final: { winner: "BRA" } } }),
    ).rejects.toBeInstanceOf(ShareSecretMissingError)

    const decoded = await decodeBracketToken("any.token.here")
    expect(decoded).toBeNull()
  })

  it("builds share URLs with locale param for English", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://wc26.example"
    const url = buildShareUrl("token123", "en-US")
    expect(url).toContain("https://wc26.example/b/token123")
    expect(url).toContain("lang=en")
  })
})
