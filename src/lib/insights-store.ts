import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { AIInsight } from "@/lib/types";

const BLOB_KEY = "insights.json";
const MAX_STORED_INSIGHTS = 500;

const LOCAL_DIR = path.join(process.cwd(), "data");
const LOCAL_PATH = path.join(LOCAL_DIR, "insights.json");

function isVercel(): boolean {
  return !!process.env.VERCEL;
}

export async function loadInsights(): Promise<AIInsight[]> {
  if (isVercel()) {
    try {
      const { list, getDownloadUrl } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
      if (blobs.length > 0) {
        const url = getDownloadUrl(blobs[0].url);
        const res = await fetch(url);
        if (res.ok) {
          return (await res.json()) as AIInsight[];
        }
      }
    } catch {
      // Blob read failed — fall through to bundled data
    }
  }

  // Local or fallback to bundled seed data
  for (const filePath of [LOCAL_PATH]) {
    if (existsSync(filePath)) {
      try {
        return JSON.parse(readFileSync(filePath, "utf-8"));
      } catch {
        // corrupted — skip
      }
    }
  }
  return [];
}

export async function saveInsights(insights: AIInsight[]): Promise<void> {
  const trimmed = insights.slice(0, MAX_STORED_INSIGHTS);

  if (isVercel()) {
    const { put } = await import("@vercel/blob");
    await put(BLOB_KEY, JSON.stringify(trimmed, null, 2), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });
    return;
  }

  // Local filesystem
  if (!existsSync(LOCAL_DIR)) {
    mkdirSync(LOCAL_DIR, { recursive: true });
  }
  writeFileSync(LOCAL_PATH, JSON.stringify(trimmed, null, 2));
}
