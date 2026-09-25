import Link from "next/link";
import type { ReactNode } from "react";

import { PreferenceToggles } from "@/components/ui/PreferenceToggles";
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
        {children ?? (
          <Link href="/login" className="text-sm font-medium text-text-2 hover:text-text-1">
            Log in
          </Link>
        )}
        <PreferenceToggles />
      </nav>
    </header>
  );
}
