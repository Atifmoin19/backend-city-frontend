"use client";

import { Gamepad2 } from "lucide-react";
import Link from "next/link";

import { useSession } from "@/features/auth/useSession";
import { cn } from "@/lib/cn";

/** First practice game, no account needed. Hidden once signed in. */
export const GUEST_GAME = "/play/signal-codes?mode=practice";

export function TryAsGuest({ className }: { className?: string }) {
  const { data: user, isPending } = useSession();
  if (isPending || user) return null;
  return (
    <Link
      href={GUEST_GAME}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-cyan underline-offset-4 hover:underline",
        className,
      )}
    >
      <Gamepad2 aria-hidden className="size-4" /> Or try a game first, no account needed
    </Link>
  );
}
