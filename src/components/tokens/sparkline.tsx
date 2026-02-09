"use client";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

export function Sparkline({ data, width = 80, height = 24 }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const isPositive = data[data.length - 1] >= data[0];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? "#34D399" : "#F87171"}
        strokeWidth="1.5"
      />
    </svg>
  );
}
