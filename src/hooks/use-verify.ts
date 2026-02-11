"use client";

import { useState, useCallback } from "react";

interface VerifyResult {
  verified: boolean;
  predictionId: number;
}

export function useVerify() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(async (predictionId: number, content: string) => {
    setIsVerifying(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/chain/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictionId, content }),
      });

      if (!res.ok) {
        throw new Error(`Verification failed: ${res.status}`);
      }

      const data: VerifyResult = await res.json();
      setResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed";
      setError(message);
      return null;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { verify, isVerifying, result, error, reset };
}
