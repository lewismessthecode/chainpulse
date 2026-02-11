"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Brain, Coins, Fish, History, Bot } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
  { href: "/insights", icon: Brain, label: "AI" },
  { href: "/tokens", icon: Coins, label: "Tokens" },
  { href: "/whales", icon: Fish, label: "Whales" },
  { href: "/predictions", icon: History, label: "History" },
  { href: "/build-log", icon: Bot, label: "Build" },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      data-testid="mobile-nav"
      className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-[#1A1A1A] flex items-center justify-around z-50 md:hidden"
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 text-[10px] uppercase tracking-wider transition-colors duration-150 ${
              isActive ? "text-amber" : "text-warm-muted"
            }`}
          >
            <Icon size={18} strokeWidth={1.5} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
