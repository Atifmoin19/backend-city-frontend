"use client";

import { useEffect, useState } from "react";

import { Wordmark } from "@/components/layout/Wordmark";
import { PreferenceToggles } from "@/components/ui/PreferenceToggles";
import { HeaderSessionNav } from "@/features/session/HeaderSessionNav";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "#academy", label: "The city" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

/** Transparent over the 3D hero, turns into a solid bar once you scroll. */
export function LandingHeader() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(scrollY > 40);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-(--bc-dur-3)",
        solid ? "border-b border-line bg-bg-0/80 backdrop-blur-md" : "border-b border-transparent",
      )}
    >
      <div className="flex h-16 items-center gap-8 px-5 sm:px-10 lg:px-16">
        <Wordmark />
        <nav aria-label="Sections" className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-text-2 transition-colors hover:text-text-1"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <HeaderSessionNav />
          <PreferenceToggles />
        </div>
      </div>
    </header>
  );
}
