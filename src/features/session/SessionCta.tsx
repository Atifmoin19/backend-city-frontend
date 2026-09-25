"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";
import { useSession } from "@/features/auth/useSession";

type Size = "md" | "lg";

/** Primary call to action that knows whether you're signed in. Never sends a user back to signup. */
export function SessionCta({ size = "lg", className }: { size?: Size; className?: string }) {
  const { data: user, isPending } = useSession();
  if (!isPending && user) {
    return (
      <Link href="/map" className={buttonClasses({ size, className })}>
        Continue your shift <ArrowRight aria-hidden className="size-4" />
      </Link>
    );
  }
  return (
    <Link href="/signup" className={buttonClasses({ size, className })}>
      Start your first shift <ArrowRight aria-hidden className="size-4" />
    </Link>
  );
}
