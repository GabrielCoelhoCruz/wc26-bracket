"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { setTeamCatalog, teams as staticTeams } from "@/data/teams"
import type { Team } from "@/types/wc26"

const CatalogContext = createContext(0)

export function useCatalogVersion(): number {
  return useContext(CatalogContext)
}

interface CatalogProviderProps {
  children: ReactNode
}

/**
 * Loads merged team catalog from /api/teams so flags/groups from Supabase
 * propagate to existing UI without adding new product features.
 */
export function CatalogProvider({ children }: CatalogProviderProps) {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false

    const hydrate = async () => {
      try {
        const res = await fetch("/api/teams")
        if (!res.ok) return
        const data = (await res.json()) as { teams?: Team[] }
        if (!cancelled && data.teams?.length) {
          setTeamCatalog(data.teams)
          setVersion((v) => v + 1)
        }
      } catch {
        setTeamCatalog([...staticTeams])
      }
    }

    void hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <CatalogContext.Provider value={version}>{children}</CatalogContext.Provider>
  )
}
