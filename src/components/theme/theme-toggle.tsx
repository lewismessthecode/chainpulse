"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const THEMES = ["light", "dark", "system"] as const;
const ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  const current = (theme ?? "system") as (typeof THEMES)[number];
  const nextIndex = (THEMES.indexOf(current) + 1) % THEMES.length;
  const next = THEMES[nextIndex];
  const Icon = ICONS[current];

  return (
    <button
      onClick={() => setTheme(next)}
      className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-accent-theme transition-colors"
      title={`Theme: ${current}`}
      aria-label={`Switch to ${next} theme`}
    >
      <Icon size={16} strokeWidth={1.5} />
    </button>
  );
}
