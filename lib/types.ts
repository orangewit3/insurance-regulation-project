import { z } from "zod"

export const InsuranceRegulationSchema = z.object({
  bill: z.string(),
  state: z.string(),
  status: z.string().transform(s => s.trim()),
  isInsuranceRelated: z.boolean(),
  isRuleP1Affected: z.boolean(),
  isRuleP2Affected: z.boolean(),
  P1EffectExplanation: z.string(),
  P2EffectExplanation: z.string(),
  summary: z.string(),
  section: z.string()
})

export type InsuranceRegulation = z.infer<typeof InsuranceRegulationSchema>