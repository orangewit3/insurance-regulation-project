import { InsuranceRegulation } from "@/lib/types"
import { RegulationCard } from "@/components/ui/regulation-card"

async function getRegulations() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/regulations`, {
    cache: "no-store",
  })
  
  if (!res.ok) {
    throw new Error("Failed to fetch regulations")
  }

  const data = await res.json()
  return data.bills as InsuranceRegulation[]
}

export default async function Home() {
  const regulations = await getRegulations()

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Insurance Regulations 2024</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regulations.map((regulation) => (
          <RegulationCard 
            key={regulation.bill} 
            regulation={regulation} 
          />
        ))}
      </div>
    </main>
  )
}
