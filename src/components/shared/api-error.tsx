"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ApiErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function ApiError({
  message = "Unable to load data",
  onRetry,
}: ApiErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <AlertTriangle className="w-8 h-8 text-amber" />
      <p className="text-warm-gray text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-faint border border-[#1A1A1A] text-amber text-xs font-mono uppercase tracking-wider hover:border-amber transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      )}
    </div>
  );
}
