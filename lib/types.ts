import { z } from "zod"

export const InsuranceRegulationSchema = z.object({
  bill: z.string(),
  state: z.string(),
  status: z.string().transform(s => s.trim()),
  isInsuranceRelated: z.boolean(),
  isRuleP1Affected: z.boolean(),
  isRuleP2Affected: z.boolean(),
  P1EffectExplanation: z.string().nullable().transform(s => s ?? "No effect on Rule P1"),
  P2EffectExplanation: z.string().nullable().transform(s => s ?? "No effect on Rule P2"),
  summary: z.string(),
  section: z.string()
})

export type InsuranceRegulation = z.infer<typeof InsuranceRegulationSchema>