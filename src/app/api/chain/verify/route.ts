import { NextResponse } from "next/server";
import { getReadContract } from "@/lib/blockchain/contract";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { predictionId, content } = body;

    if (
      typeof predictionId !== "number" ||
      !Number.isInteger(predictionId) ||
      predictionId < 0 ||
      typeof content !== "string" ||
      content.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid predictionId (non-negative integer) or content (non-empty string) required" },
        { status: 400 },
      );
    }

    const contract = getReadContract();
    const verified = await contract.verifyPrediction(predictionId, content);

    return NextResponse.json({ verified, predictionId });
  } catch {
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 },
    );
  }
}
