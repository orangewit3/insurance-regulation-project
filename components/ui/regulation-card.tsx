import { InsuranceRegulation } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RegulationCardProps {
  regulation: InsuranceRegulation
}

export function RegulationCard({ regulation }: RegulationCardProps) {
  const cleanBillNumber = regulation.bill.replace(/\s+/g, ' ').trim()
  
  const getStatusDisplay = (status: string) => {
    const normalized = status.toLowerCase().trim()
    if (normalized.includes('assigned') || normalized.includes('signed')) return 'Passed'
    return 'Failed'
  }

  const getStatusVariant = (status: string) => {
    const normalized = status.toLowerCase().trim()
    if (normalized.includes('assigned') || normalized.includes('signed')) return 'success'
    return 'failed'
  }
  
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {cleanBillNumber} - {regulation.state}
          </CardTitle>
          <Badge variant={getStatusVariant(regulation.status)}>
            {getStatusDisplay(regulation.status)}
          </Badge>
        </div>
        <div className="mt-2 inline-block">
          <span className="px-2 py-1 bg-orange-50 rounded-md border border-orange-200 text-sm font-medium text-orange-800">
            {regulation.section}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{regulation.summary}</p>
        
        <div className="p-3 bg-yellow-50 rounded-md">
          <p className="text-sm font-medium text-yellow-900">Rule P1 Impact:</p>
          <p className="text-sm text-yellow-800">
            {regulation.isRuleP1Affected 
              ? regulation.P1EffectExplanation 
              : "No impact on Rule P1"}
          </p>
        </div>
        
        <div className="p-3 bg-blue-50 rounded-md">
          <p className="text-sm font-medium text-blue-900">Rule P2 Impact:</p>
          <p className="text-sm text-blue-800">
            {regulation.isRuleP2Affected 
              ? regulation.P2EffectExplanation 
              : "No impact on Rule P2"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 