import { GoogleGenerativeAI } from "@google/generative-ai";
import { ethers } from "ethers";

import { getWriteContract } from "@/lib/blockchain/contract";
import { loadInsights, saveInsights } from "@/lib/insights-store";
import type { AIInsight, MarketOverview, TokenData, WhaleAlert } from "@/lib/types";

import { buildAnalysisPrompt, SYSTEM_INSTRUCTION } from "./prompts";
import { analysisResponseSchema } from "./schema";

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

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured");
  }
  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      topP: 0.9,
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = analysisResponseSchema.parse(JSON.parse(text));

  const contract = getWriteContract();

  const insights: AIInsight[] = parsed.insights.map((insight, i) => {
    const contentJson = JSON.stringify(insight);
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes(contentJson));

    return {
      id: `${Date.now()}-${i}`,
      ...insight,
      contentHash,
      createdAt: new Date().toISOString(),
    };
  });

  const hashes = insights.map((ins) => ins.contentHash);
  const categories = insights.map((ins) => {
    const idx = CATEGORY_MAP[ins.category];
    if (idx === undefined) {
      throw new Error(`Unknown category from AI: ${ins.category}`);
    }
    return idx;
  });
  const sentiments = insights.map((ins) => ins.sentimentScore);
  const summaries = insights.map((ins) => ins.summary);

  const tx = await contract.storePredictionBatch(hashes, categories, sentiments, summaries);
  const receipt = await tx.wait();

  const predictionCount = await contract.predictionCount();
  const insightsWithTx = insights.map((insight, i) => ({
    ...insight,
    txHash: receipt.hash,
    predictionId: Number(predictionCount) - insights.length + i,
  }));

  const existing = await loadInsights();
  await saveInsights([...insightsWithTx, ...existing]);

  return { insights: insightsWithTx, txHash: receipt.hash };
}

