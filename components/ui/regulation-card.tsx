import { InsuranceRegulation } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RegulationCardProps {
  regulation: InsuranceRegulation
}

export function RegulationCard({ regulation }: RegulationCardProps) {
  const cleanBillNumber = regulation.bill.replace(/\s+/g, ' ').trim()
  
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {cleanBillNumber} - {regulation.state}
          </CardTitle>
          <Badge 
            variant={regulation.status.toLowerCase().includes('signed') ? "success" : "default"}
          >
            {regulation.status.trim()}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{regulation.section}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{regulation.summary}</p>
        
        {regulation.isRuleP1Affected && (
          <div className="p-3 bg-yellow-50 rounded-md">
            <p className="text-sm font-medium text-yellow-900">Rule P1 Impact:</p>
            <p className="text-sm text-yellow-800">{regulation.P1EffectExplanation}</p>
          </div>
        )}
        
        {regulation.isRuleP2Affected && (
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm font-medium text-blue-900">Rule P2 Impact:</p>
            <p className="text-sm text-blue-800">{regulation.P2EffectExplanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 