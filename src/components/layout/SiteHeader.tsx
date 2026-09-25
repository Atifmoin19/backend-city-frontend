import type { ReactNode } from "react";

import { HeaderSessionNav } from "@/features/session/HeaderSessionNav";

import { cn } from "@/lib/cn";

import { Wordmark } from "./Wordmark";

export function SiteHeader({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <header
      className={cn(
        "relative z-20 flex h-16 items-center justify-between gap-4 px-5 sm:px-8",
        className,
      )}
    >
      <Wordmark />
      <nav className="flex items-center gap-2 sm:gap-4" aria-label="Main">
        {children ?? <HeaderSessionNav />}
      </nav>
    </header>
  );
}
