import { LayoutDashboard, Brain, Coins, Fish, History, Bot } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard", shortLabel: "Home" },
  { href: "/insights", icon: Brain, label: "AI Insights", shortLabel: "AI" },
  { href: "/tokens", icon: Coins, label: "Tokens", shortLabel: "Tokens" },
  { href: "/whales", icon: Fish, label: "Whales", shortLabel: "Whales" },
  { href: "/predictions", icon: History, label: "Predictions", shortLabel: "History" },
  { href: "/build-log", icon: Bot, label: "Build Log", shortLabel: "Build" },
] as const;
