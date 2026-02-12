"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      data-testid="mobile-nav"
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border-subtle flex items-center justify-around z-50 md:hidden"
    >
      {NAV_ITEMS.map(({ href, icon: Icon, shortLabel }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 text-[10px] uppercase tracking-wider transition-colors duration-150 ${
              isActive ? "text-accent-theme" : "text-text-muted"
            }`}
          >
            <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
            <span>{shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
