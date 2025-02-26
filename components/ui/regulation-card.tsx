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

  const formatExplanation = (text: string) => {
    const paragraphs = text.split('\n\n')
    return {
      orgImpact: paragraphs[0]?.replace('Impact on ', ''),
      rulesImpact: paragraphs[1]?.replace('Impact on ', ''),
      nextSteps: paragraphs[2]?.replace('Suggested Next Steps: ', '')
    }
  }
  
  const p1Details = formatExplanation(regulation.P1EffectExplanation)
  const p2Details = formatExplanation(regulation.P2EffectExplanation)
  
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
        
        {regulation.isRuleP1Affected ? (
          <div className="p-4 bg-yellow-50 rounded-md space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <p className="text-sm font-semibold text-yellow-900">Rule P1 Impact</p>
            </div>
            
            <div className="space-y-4 pl-4 border-l-2 border-yellow-200">
              <div>
                <p className="text-sm font-bold text-yellow-900 mb-2">Wellabe's Organization</p>
                <p className="text-sm text-yellow-800">{p1Details.orgImpact}</p>
              </div>
              
              <div>
                <p className="text-sm font-bold text-yellow-900 mb-2">Short-term Insurance Underwriting</p>
                <p className="text-sm text-yellow-800">{p1Details.rulesImpact}</p>
              </div>
              
              <div>
                <p className="text-sm font-bold text-yellow-900 mb-2">Next Steps</p>
                <p className="text-sm text-yellow-800">{p1Details.nextSteps}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-yellow-50/50 rounded-md">
            <p className="text-sm text-yellow-800/70">No impact on Rule P1</p>
          </div>
        )}
        
        {regulation.isRuleP2Affected ? (
          <div className="p-4 bg-blue-50 rounded-md space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <p className="text-sm font-semibold text-blue-900">Rule P2 Impact</p>
            </div>
            
            <div className="space-y-4 pl-4 border-l-2 border-blue-200">
              <div>
                <p className="text-sm font-bold text-blue-900 mb-2">MassMutual's Organization</p>
                <p className="text-sm text-blue-800">{p2Details.orgImpact}</p>
              </div>
              
              <div>
                <p className="text-sm font-bold text-blue-900 mb-2">Life Insurance Underwriting</p>
                <p className="text-sm text-blue-800">{p2Details.rulesImpact}</p>
              </div>
              
              <div>
                <p className="text-sm font-bold text-blue-900 mb-2">Next Steps</p>
                <p className="text-sm text-blue-800">{p2Details.nextSteps}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-blue-50/50 rounded-md">
            <p className="text-sm text-blue-800/70">No impact on Rule P2</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 