import Link from "next/link";
import type { ReactNode } from "react";

import { Wordmark } from "@/components/layout/Wordmark";
import { PreferenceToggles } from "@/components/ui/PreferenceToggles";
import { SignHeading } from "@/components/ui/SignHeading";

interface AuthShellProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  aside: ReactNode;
  footer: ReactNode;
}

/** Two-column gate: form on a solid plate, the "what the server sees" view beside it. */
export function AuthShell({ title, subtitle, children, aside, footer }: AuthShellProps) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-bg-0">
      <div
        aria-hidden
        data-ambient
        className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(ellipse_at_70%_40%,rgb(62_230_255/0.07),transparent_65%)] lg:block"
      />
      <header className="relative z-10 flex h-16 items-center justify-between px-5 sm:px-8">
        <Wordmark />
        <PreferenceToggles />
      </header>
      <main className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 pt-6 pb-16 sm:px-8 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-20 lg:pt-16">
        <div>
          <SignHeading as="h1" className="text-[clamp(1.9rem,4vw,2.6rem)]">
            {title}
          </SignHeading>
          <p className="mt-3 text-text-2">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-sm text-text-2">{footer}</p>
        </div>
        <aside className="min-w-0">{aside}</aside>
      </main>
      <p className="sr-only">
        <Link href="/">Back to home</Link>
      </p>
    </div>
  );
}
