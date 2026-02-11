import { NextResponse } from "next/server";
import { getReadContract } from "@/lib/blockchain/contract";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { predictionId, content } = await request.json();

    if (predictionId === undefined || !content) {
      return NextResponse.json(
        { error: "Missing predictionId or content" },
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
