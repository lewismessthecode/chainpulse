"use client";

export function LiveIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <div className="w-1.5 h-1.5 bg-[#34D399] rounded-full" />
        <div className="absolute inset-0 w-1.5 h-1.5 bg-[#34D399] rounded-full animate-ping opacity-75" />
      </div>
      <span className="text-[10px] uppercase tracking-[0.08em] text-warm-gray font-body">
        Live
      </span>
    </div>
  );
}
