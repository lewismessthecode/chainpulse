import { z } from "zod";

export const insightSchema = z.object({
  category: z.enum(["TREND", "RISK", "WHALE_ALERT", "MARKET_INSIGHT"]),
  title: z.string().max(80),
  summary: z.string().max(200),
  fullAnalysis: z.string(),
  sentimentScore: z.number().int().min(-100).max(100),
  confidence: z.number().int().min(0).max(100),
  dataPoints: z.array(z.string()),
});

export const analysisResponseSchema = z.object({
  insights: z.array(insightSchema).min(1).max(5),
});

export type InsightOutput = z.infer<typeof insightSchema>;
export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;
