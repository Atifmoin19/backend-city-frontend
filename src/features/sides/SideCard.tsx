"use client";

import { ArrowRight, BellRing, Check, Clock } from "lucide-react";
import Link from "next/link";

import { Button, buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

import { SideArt } from "./SideArt";
import type { SideState } from "./useSides";

/** One side of the city. Open sides enter; coming-soon sides take a Notify me (saved to the
 * account, or carried through signup). Phones get a compact card (no body or topic chips). */
export function SideCard({
  side,
  signedIn,
  pending,
  onNotify,
  className,
}: {
  side: SideState;
  signedIn: boolean;
  pending: boolean;
  onNotify: () => void;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "flex flex-col rounded-xl border p-4 shadow-panel sm:p-6",
        side.open ? "border-cyan/50 bg-bg-2 shadow-glow-cyan" : "glass border-line",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <SideArt
          side={side.track}
          className={cn("h-10 w-12 sm:h-20 sm:w-24", side.open ? "text-cyan" : "text-text-2")}
        />
        {side.open ? (
          <span className="text-xs font-semibold text-green">Open now</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-line-strong px-2 py-0.5 text-xs font-semibold text-text-1">
            <Clock aria-hidden className="size-3.5" /> Coming soon
          </span>
        )}
      </div>
      <h3 className="mt-2 font-display text-lg font-semibold text-text-1 sm:mt-5 sm:text-xl">
        {side.name}
      </h3>
      <p className="text-sm text-text-3">{side.tagline}</p>
      <p className="mt-3 hidden flex-1 text-sm leading-relaxed text-text-2 sm:block">{side.body}</p>
      <ul className="mt-4 hidden flex-wrap gap-1.5 sm:flex">
        {side.covers.map((c) => (
          <li
            key={c}
            className="rounded-sm border border-line px-2 py-0.5 font-mono text-xs text-text-2"
          >
            {c}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-3 sm:pt-6">
        {side.open ? (
          <Link
            href={signedIn ? "/map" : `/signup?goal=${side.track}`}
            className={buttonClasses({ className: "w-full" })}
          >
            {signedIn ? "Enter the Backend District" : "Start in the Backend District"}{" "}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        ) : side.notified ? (
          <p
            className="flex h-10 items-center justify-center gap-2 text-sm text-green"
            role="status"
          >
            <Check aria-hidden className="size-4" /> We&apos;ll tell you when it opens
          </p>
        ) : signedIn ? (
          <Button
            variant="ghost"
            className="w-full"
            icon={<BellRing aria-hidden className="size-4" />}
            loading={pending}
            onClick={onNotify}
          >
            Notify me
          </Button>
        ) : (
          <Link
            href={`/signup?goal=${side.track}`}
            className={buttonClasses({ variant: "ghost", className: "w-full" })}
          >
            <BellRing aria-hidden className="size-4" /> Notify me
          </Link>
        )}
      </div>
    </li>
  );
}
