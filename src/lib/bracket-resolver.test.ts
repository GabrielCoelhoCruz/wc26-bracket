import { describe, expect, it } from "vitest"
import { getBracketSlotLabel } from "@/lib/bracket-resolver"

describe("bracket-resolver", () => {
  it("returns human-readable labels for R32 slots", () => {
    expect(getBracketSlotLabel("R32-01")).toContain("GRP")
    expect(getBracketSlotLabel("R32-01")).toContain("A")
  })

  it("falls back to empty string for unknown slots", () => {
    expect(getBracketSlotLabel("unknown-slot")).toBe("")
  })
})
