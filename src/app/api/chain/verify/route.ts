import { NextResponse } from "next/server";
import { getReadContract } from "@/lib/blockchain/contract";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { predictionId, content } = body;

    const MAX_PREDICTION_ID = 1_000_000;
    const MAX_CONTENT_LENGTH = 10_000;

    if (
      typeof predictionId !== "number" ||
      !Number.isInteger(predictionId) ||
      predictionId < 0 ||
      predictionId > MAX_PREDICTION_ID ||
      typeof content !== "string" ||
      content.length === 0 ||
      content.length > MAX_CONTENT_LENGTH
    ) {
      return NextResponse.json(
        { error: "Invalid input: predictionId must be 0-1000000, content must be 1-10000 chars" },
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
