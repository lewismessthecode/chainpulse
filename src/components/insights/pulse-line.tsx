"use client";

export function PulseLine({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 24"
      className={`text-amber ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M0 12 H30 L36 4 L42 20 L48 8 L54 16 L60 12 H120"
        strokeDasharray="200"
        strokeDashoffset="200"
        className="animate-[draw_2s_ease-out_forwards]"
      />
    </svg>
  );
}
