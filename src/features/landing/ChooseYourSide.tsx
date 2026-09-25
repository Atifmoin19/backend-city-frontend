"use client";

import { ArrowRight, BellRing, Check, Clock } from "lucide-react";
import Link from "next/link";

import { Button, buttonClasses } from "@/components/ui/Button";
import { SignHeading } from "@/components/ui/SignHeading";
import { SideArt } from "@/features/sides/SideArt";
import { useSides, type SideState } from "@/features/sides/useSides";
import { cn } from "@/lib/cn";

/** End of the tour: pick which side of the city to learn. Open sides enter, others take a
 * Notify me (saved to the account, or carried through signup). */
export function ChooseYourSide() {
  const { sides, signedIn, notifyMe } = useSides();
  return (
    <section
      id="choose"
      aria-labelledby="choose-title"
      className="relative border-t border-line bg-bg-0 px-3 py-14 sm:px-10 sm:py-24 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs text-cyan">Full Stack City</p>
        <SignHeading as="h2" id="choose-title" className="mt-2 text-[clamp(2rem,4.5vw,3.4rem)]">
          Choose your side of the city.
        </SignHeading>
        <p className="mt-3 max-w-2xl text-base text-text-2 sm:mt-4 sm:text-lg">
          The surface, the structure, or both wired together. The Backend District is open now; the
          others are being built.
        </p>
        <ul className="mt-6 grid gap-3 sm:mt-12 sm:gap-5 md:grid-cols-3">
          {sides.map((side) => (
            <SideCard
              key={side.track}
              side={side}
              signedIn={signedIn}
              pending={notifyMe.isPending && notifyMe.variables === side.track}
              onNotify={() => notifyMe.mutate(side.track)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function SideCard({
  side,
  signedIn,
  pending,
  onNotify,
}: {
  side: SideState;
  signedIn: boolean;
  pending: boolean;
  onNotify: () => void;
}) {
  return (
    <li
      className={cn(
        "flex flex-col rounded-xl border p-4 sm:p-6",
        side.open ? "border-cyan/50 bg-bg-2 shadow-glow-cyan" : "border-line bg-bg-1",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <SideArt
          side={side.track}
          className={cn("h-12 w-14 sm:h-20 sm:w-24", side.open ? "text-cyan" : "text-text-2")}
        />
        {side.open ? (
          <span className="text-xs font-semibold text-green">Open now</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-line-strong px-2 py-0.5 text-xs font-semibold text-text-1">
            <Clock aria-hidden className="size-3.5" /> Coming soon
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold text-text-1 sm:mt-5 sm:text-xl">
        {side.name}
      </h3>
      <p className="text-sm text-text-3">{side.tagline}</p>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-text-2 sm:mt-3">{side.body}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5 sm:mt-4">
        {side.covers.map((c) => (
          <li
            key={c}
            className="rounded-sm border border-line px-2 py-0.5 font-mono text-xs text-text-2"
          >
            {c}
          </li>
        ))}
      </ul>
      <div className="mt-4 sm:mt-6">
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
