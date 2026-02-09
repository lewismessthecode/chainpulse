"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Brain, Coins, Fish, History } from "lucide-react";
import { LiveIndicator } from "@/components/shared/live-indicator";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/insights", icon: Brain, label: "AI Insights" },
  { href: "/tokens", icon: Coins, label: "Tokens" },
  { href: "/whales", icon: Fish, label: "Whales" },
  { href: "/predictions", icon: History, label: "Predictions" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside data-testid="sidebar" className="fixed left-0 top-0 h-screen w-14 bg-surface border-r border-[#1A1A1A] hidden md:flex flex-col items-center py-4 z-50">
      <div className="mb-8">
        <div className="w-7 h-7 border border-amber flex items-center justify-center">
          <span className="text-amber text-xs font-mono font-bold">CP</span>
        </div>
      </div>

      <nav className="flex-1 flex flex-col items-center gap-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`group relative w-10 h-10 flex items-center justify-center transition-colors duration-150 ${
                isActive
                  ? "text-amber bg-amber-faint"
                  : "text-warm-muted hover:text-warm-gray"
              }`}
              title={label}
            >
              <Icon size={18} strokeWidth={1.5} />
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <LiveIndicator />
      </div>
    </aside>
  );
}
