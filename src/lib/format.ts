export function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatValue(
  value: number,
  prefix = "",
  suffix = "",
): string {
  if (value == null || Number.isNaN(value)) return `${prefix}0${suffix}`;
  const formatted =
    value >= 1_000_000_000
      ? `${(value / 1_000_000_000).toFixed(2)}B`
      : value >= 1_000_000
        ? `${(value / 1_000_000).toFixed(2)}M`
        : value >= 1_000
          ? `${(value / 1_000).toFixed(1)}K`
          : value.toFixed(2);
  return `${prefix}${formatted}${suffix}`;
}
