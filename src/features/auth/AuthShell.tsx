import type { ReactNode } from "react";

import { Wordmark } from "@/components/layout/Wordmark";
import { PreferenceToggles } from "@/components/ui/PreferenceToggles";
import { SignHeading } from "@/components/ui/SignHeading";
import { SkylineCanvas } from "@/features/landing/skyline/SkylineCanvas";

interface AuthShellProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  /** Big line on the visual side. */
  tagline: ReactNode;
  /** Floating card over the skyline (the gate + request preview). */
  aside: ReactNode;
  footer: ReactNode;
}

/** Split screen: a living city on the left, a focused form on the right. */
export function AuthShell({ title, subtitle, children, tagline, aside, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-dvh bg-bg-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      {/* Visual side */}
      <section
        className="relative isolate hidden overflow-hidden border-r border-line lg:flex lg:flex-col"
        aria-label="Backend City"
      >
        <SkylineCanvas className="absolute inset-0 -z-10 size-full" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(11_17_36/0.92)_0%,rgb(11_17_36/0.35)_45%,rgb(11_17_36/0.85)_100%)]"
        />
        <div
          aria-hidden
          className="absolute -top-32 -left-24 -z-10 size-[30rem] rounded-full bg-purple/15 blur-3xl"
        />
        <div className="flex h-16 items-center px-10">
          <Wordmark />
        </div>
        <div className="px-10 pt-10 xl:px-14">
          <p className="max-w-lg font-display text-[clamp(2rem,3.4vw,3.1rem)] leading-[1.04] font-bold tracking-[-0.02em] text-text-1">
            {tagline}
          </p>
        </div>
        <div className="mt-auto px-10 pb-10 xl:px-14">{aside}</div>
      </section>

      {/* Form side */}
      <section className="relative flex flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 size-96 rounded-full bg-cyan/[0.07] blur-3xl"
        />
        <header className="relative flex h-16 items-center justify-between px-5 sm:px-10">
          <span className="lg:hidden">
            <Wordmark />
          </span>
          <span className="hidden lg:block" />
          <PreferenceToggles />
        </header>
        <main className="relative flex flex-1 items-center px-5 py-10 sm:px-10">
          <div className="mx-auto w-full max-w-md">
            <SignHeading as="h1" className="text-[clamp(2rem,3.4vw,2.75rem)]">
              {title}
            </SignHeading>
            <p className="mt-3 text-text-2">{subtitle}</p>
            <div className="mt-9">{children}</div>
            <p className="mt-8 border-t border-line pt-6 text-sm text-text-2">{footer}</p>
            {/* On small screens the gate preview moves under the form */}
            <div className="mt-10 lg:hidden">{aside}</div>
          </div>
        </main>
      </section>
    </div>
  );
}
