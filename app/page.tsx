"use client"

import { useSearch } from "@/hooks/use-search"
import { useFilters } from "@/hooks/use-filters"
import type { InsuranceRegulation } from "@/lib/types"
import { RegulationCard } from "@/components/ui/regulation-card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const [regulations, setRegulations] = useState<InsuranceRegulation[]>([])
  const [loading, setLoading] = useState(true)

  const {
    filters,
    setFilters,
    uniqueStates,
    uniqueSections,
    filteredItems: filteredByFilters,
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
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Insurance Regulations 2024</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search regulations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value })}>
                <option value="">All States</option>
                {uniqueStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Select>

              <Select
                value={filters.status}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value as "all" | "passed" | "failed",
                  })
                }
              >
                <option value="all">All Status</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
              </Select>

              <Select
                value={filters.ruleAffected}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    ruleAffected: e.target.value as "all" | "P1" | "P2",
                  })
                }
              >
                <option value="all">All Rules</option>
                <option value="P1">Rule P1</option>
                <option value="P2">Rule P2</option>
              </Select>

              <Select value={filters.section} onChange={(e) => setFilters({ ...filters, section: e.target.value })}>
                <option value="">All Sections</option>
                {uniqueSections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-6">
        <p className="text-lg font-semibold text-muted-foreground">
          {filteredItems.length} regulation{filteredItems.length !== 1 ? "s" : ""} found
        </p>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="w-full">
              <CardHeader>
                <Skeleton className="h-4 w-[250px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-[200px] mb-2" />
                <Skeleton className="h-4 w-[150px] mb-2" />
                <Skeleton className="h-4 w-[100px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((regulation) => (
            <RegulationCard key={regulation.bill} regulation={regulation} />
          ))}
        </div>
      )}
    </main>
  )
}

