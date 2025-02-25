import { useState, useMemo } from "react"
import { InsuranceRegulation } from "@/lib/types"

interface Filters {
  state: string
  status: string
  ruleAffected: "all" | "P1" | "P2"
}

export function useFilters(items: InsuranceRegulation[]) {
  const [filters, setFilters] = useState<Filters>({
    state: "",
    status: "",
    ruleAffected: "all"
  })

  const uniqueStates = useMemo(() => {
    return Array.from(new Set(items.map(item => item.state))).sort()
  }, [items])

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(items.map(item => item.status.trim()))).sort()
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filters.state && item.state !== filters.state) {
        return false
      }
      
      if (filters.status && item.status.trim() !== filters.status) {
        return false
      }
      
      if (filters.ruleAffected === "P1" && !item.isRuleP1Affected) {
        return false
      }
      
      if (filters.ruleAffected === "P2" && !item.isRuleP2Affected) {
        return false
      }
      
      return true
    })
  }, [items, filters])

  return {
    filters,
    setFilters,
    uniqueStates,
    uniqueStatuses,
    filteredItems
  }
} 