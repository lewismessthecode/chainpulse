"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LiveIndicator } from "@/components/shared/live-indicator";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NAV_ITEMS } from "@/lib/nav-items";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside data-testid="sidebar" className="fixed left-0 top-0 h-screen w-14 bg-surface border-r border-border-subtle hidden md:flex flex-col items-center py-4 z-50">
      <div className="mb-8">
        <div className="w-7 h-7 border border-accent-theme rounded-lg flex items-center justify-center">
          <span className="text-accent-theme text-xs font-mono font-bold">CP</span>
        </div>
      </div>

      <nav aria-label="Main navigation" className="flex-1 flex flex-col items-center gap-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={`group relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-150 ${
                isActive
                  ? "text-accent-theme bg-accent-faint"
                  : "text-text-muted hover:text-text-secondary"
              }`}
              title={label}
            >
              <Icon size={18} strokeWidth={1.5} />
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-theme rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-3">
        <ThemeToggle />
        <LiveIndicator />
      </div>
    </aside>
  );
}
