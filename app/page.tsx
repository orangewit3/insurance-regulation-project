"use client"

import { useSearch } from "@/hooks/use-search"
import { useFilters } from "@/hooks/use-filters"
import { InsuranceRegulation } from "@/lib/types"
import { RegulationCard } from "@/components/ui/regulation-card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useState, useEffect, useMemo } from "react"

export default function Home() {
  const [regulations, setRegulations] = useState<InsuranceRegulation[]>([])
  const [loading, setLoading] = useState(true)
  
  const {
    filters,
    setFilters,
    uniqueStates,
    uniqueStatuses,
    filteredItems: filteredByFilters
  } = useFilters(regulations)
  
  const { searchQuery, setSearchQuery, filteredItems } = useSearch(filteredByFilters)

  useEffect(() => {
    async function fetchRegulations() {
      try {
        const res = await fetch("/api/regulations")
        const data = await res.json()
        setRegulations(data.bills)
      } catch (error) {
        console.error("Failed to fetch regulations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRegulations()
  }, [])

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Insurance Regulations 2024</h1>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search regulations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                className="flex-1"
              >
                <option value="">All States</option>
                {uniqueStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </Select>

              <Select
                value={filters.status}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  status: e.target.value as "all" | "passed" | "failed" 
                })}
                className="flex-1"
              >
                <option value="all">All Status</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
              </Select>

              <Select
                value={filters.ruleAffected}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  ruleAffected: e.target.value as "all" | "P1" | "P2"
                })}
                className="flex-1"
              >
                <option value="all">All Rules</option>
                <option value="P1">Rule P1</option>
                <option value="P2">Rule P2</option>
              </Select>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} regulation{filteredItems.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {loading ? (
          <div className="text-center">Loading regulations...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((regulation) => (
              <RegulationCard 
                key={regulation.bill} 
                regulation={regulation} 
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
