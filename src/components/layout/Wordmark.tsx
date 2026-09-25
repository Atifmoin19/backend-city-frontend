import Link from "next/link";

import { cn } from "@/lib/cn";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 font-display text-[0.95rem] font-bold tracking-tight",
        className,
      )}
    >
      <span
        aria-hidden
        className="grid size-7 place-items-center rounded-sm border border-cyan/50 bg-bg-2 shadow-glow-cyan transition-shadow group-hover:shadow-[0_0_0_1px_rgb(var(--bc-cyan-rgb)/0.6),0_0_24px_rgb(var(--bc-cyan-rgb)/0.6)]"
      >
        <span className="size-2 rounded-full bg-cyan" />
      </span>
      <span>
        BACKEND <span className="text-cyan">CITY</span>
      </span>
    </Link>
  );
}
