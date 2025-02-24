"use client"

import { useSearch } from "@/hooks/use-search"
import { InsuranceRegulation } from "@/lib/types"
import { RegulationCard } from "@/components/ui/regulation-card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState, useEffect } from "react"

export default function Home() {
  const [regulations, setRegulations] = useState<InsuranceRegulation[]>([])
  const [loading, setLoading] = useState(true)
  const { searchQuery, setSearchQuery, filteredItems } = useSearch(regulations)

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
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search regulations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
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
