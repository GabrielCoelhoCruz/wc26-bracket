/** Parse API scorer strings into a readable list */
export function parseScorers(raw: string | null | undefined): string[] | undefined {
  if (!raw || raw === "null" || raw.trim() === "") return undefined

  const trimmed = raw.trim()

  // Already JSON array like {"Player 12'","Player 67'"}
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const wrapped = `[${trimmed.slice(1, -1)}]`
      const parsed = JSON.parse(wrapped) as unknown
      if (Array.isArray(parsed)) {
        return parsed.map(String).filter(Boolean)
      }
    } catch {
      // fall through to regex extraction
    }

    const matches = trimmed.match(/"([^"]+)"/g)
    if (matches?.length) {
      return matches.map((m) => m.replace(/^"|"$/g, ""))
    }
  }

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
    } catch {
      return [trimmed]
    }
  }

  return [trimmed]
}
