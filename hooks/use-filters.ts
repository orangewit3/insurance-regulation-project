import { useState, useMemo } from "react"
import { InsuranceRegulation } from "@/lib/types"

interface Filters {
  state: string
  status: "all" | "passed" | "failed"
  ruleAffected: "all" | "P1" | "P2"
  section: string
}

export function useFilters(items: InsuranceRegulation[]) {
  const [filters, setFilters] = useState<Filters>({
    state: "",
    status: "all",
    ruleAffected: "all",
    section: ""
  })

  const uniqueStates = useMemo(() => {
    return Array.from(new Set(items.map(item => item.state))).sort()
  }, [items])

  const uniqueSections = useMemo(() => {
    return Array.from(new Set(items.map(item => item.section))).sort()
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filters.state && item.state !== filters.state) {
        return false
      }
      
      if (filters.status !== "all") {
        const normalized = item.status.toLowerCase().trim()
        const isPassed = normalized.includes('assigned') || normalized.includes('signed')
        if (filters.status === "passed" && !isPassed) return false
        if (filters.status === "failed" && isPassed) return false
      }
      
      if (filters.ruleAffected === "P1" && !item.isRuleP1Affected) {
        return false
      }
      
      if (filters.ruleAffected === "P2" && !item.isRuleP2Affected) {
        return false
      }

      if (filters.section && item.section !== filters.section) {
        return false
      }
      
      return true
    })
  }, [items, filters])

  return {
    filters,
    setFilters,
    uniqueStates,
    uniqueSections,
    filteredItems
  }
} 