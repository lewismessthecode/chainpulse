import { NextResponse } from "next/server";
import { getReadContract } from "@/lib/blockchain/contract";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { predictionId, contentHash } = await request.json();

    if (predictionId === undefined || !contentHash) {
      return NextResponse.json(
        { error: "Missing predictionId or contentHash" },
        { status: 400 },
      );
    }

    const contract = getReadContract();
    const verified = await contract.verifyPrediction(predictionId, contentHash);

    return NextResponse.json({ verified, predictionId, contentHash });
  } catch {
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 },
    );
  }
}
