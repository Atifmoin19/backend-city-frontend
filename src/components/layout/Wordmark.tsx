import Link from "next/link";

import { cn } from "@/lib/cn";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex shrink-0 items-center gap-2 font-display text-[0.88rem] font-bold tracking-tight whitespace-nowrap sm:gap-2.5 sm:text-[0.95rem]",
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
        FULL STACK <span className="text-cyan">CITY</span>
      </span>
    </Link>
  );
}
