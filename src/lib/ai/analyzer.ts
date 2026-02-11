import { GoogleGenerativeAI } from "@google/generative-ai";
import { ethers } from "ethers";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { getWriteContract } from "@/lib/blockchain/contract";
import type { AIInsight, MarketOverview, TokenData, WhaleAlert } from "@/lib/types";

import { buildAnalysisPrompt } from "./prompts";
import { analysisResponseSchema } from "./schema";

const INSIGHTS_PATH = path.join(process.cwd(), "data", "insights.json");

const CATEGORY_MAP: Record<string, number> = {
  TREND: 0,
  RISK: 1,
  WHALE_ALERT: 2,
  MARKET_INSIGHT: 3,
};

export async function runAnalysis(marketData: {
  overview: MarketOverview;
  tokens: TokenData[];
  whales: WhaleAlert[];
}): Promise<{ insights: AIInsight[]; txHash: string }> {
  const prompt = buildAnalysisPrompt(marketData);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = analysisResponseSchema.parse(JSON.parse(text));

  const contract = getWriteContract();

  const hashes: string[] = [];
  const categories: number[] = [];
  const sentiments: number[] = [];
  const summaries: string[] = [];

  const insights: AIInsight[] = parsed.insights.map((insight, i) => {
    const contentJson = JSON.stringify(insight);
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes(contentJson));

    hashes.push(contentHash);
    categories.push(CATEGORY_MAP[insight.category]);
    sentiments.push(insight.sentimentScore);
    summaries.push(insight.summary);

    return {
      id: `${Date.now()}-${i}`,
      ...insight,
      contentHash,
      createdAt: new Date().toISOString(),
    };
  });

  const tx = await contract.storePredictionBatch(hashes, categories, sentiments, summaries);
  const receipt = await tx.wait();

  const predictionCount = await contract.predictionCount();
  const insightsWithTx = insights.map((insight, i) => ({
    ...insight,
    txHash: receipt.hash,
    predictionId: Number(predictionCount) - insights.length + i,
  }));

  const existing = loadInsights();
  saveInsights([...insightsWithTx, ...existing]);

  return { insights: insightsWithTx, txHash: receipt.hash };
}

function loadInsights(): AIInsight[] {
  if (!existsSync(INSIGHTS_PATH)) {
    return [];
  }
  return JSON.parse(readFileSync(INSIGHTS_PATH, "utf-8"));
}

function saveInsights(insights: AIInsight[]): void {
  const dir = path.dirname(INSIGHTS_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(INSIGHTS_PATH, JSON.stringify(insights, null, 2));
}
