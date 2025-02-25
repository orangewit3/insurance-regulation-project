import { useState, useMemo } from "react"
import { InsuranceRegulation } from "@/lib/types"

export function useSearch(items: InsuranceRegulation[]) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items
    }

    const query = searchQuery.toLowerCase()
    return items.filter((item) => {
      const searchableText = [
        item.bill,
        item.state,
        item.summary,
        item.P1EffectExplanation,
        item.P2EffectExplanation,
        item.section
      ].join(" ").toLowerCase()

      return searchableText.includes(query)
    })
  }, [items, searchQuery])

  return {
    searchQuery,
    setSearchQuery,
    filteredItems
  }
} 