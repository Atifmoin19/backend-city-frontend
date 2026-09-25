"use client";

import { motion } from "motion/react";

import { Bouncer } from "@/components/characters/Bouncer";
import { Byte } from "@/components/characters/Byte";
import { SignHeading } from "@/components/ui/SignHeading";
import { SessionCta } from "@/features/session/SessionCta";

import { SkylineCanvas } from "./skyline/SkylineCanvas";

const ease = [0.16, 1, 0.3, 1] as const;

// Real facts about what's built today (no invented metrics)
const FACTS = [
  { n: "3", label: "districts open" },
  { n: "14", label: "quick checks in briefings" },
  { n: "12", label: "hidden requests per checkpoint" },
  { n: "0", label: "installs needed" },
];

/** Finale: living skyline, a reactor ring around Byte, and the one action that matters. */
export function FinalCall() {
  return (
    <section className="relative isolate overflow-hidden border-t border-line bg-bg-0">
      <SkylineCanvas className="absolute inset-x-0 bottom-0 -z-10 h-[70%] w-full opacity-70" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_55%_at_50%_40%,rgb(62_230_255/0.14),transparent_70%),linear-gradient(180deg,var(--bc-bg-0)_10%,transparent_55%,var(--bc-bg-0))]"
      />

      <div className="mx-auto flex max-w-5xl flex-col items-center px-5 py-28 text-center sm:px-8 lg:py-36">
        <div className="relative grid size-48 place-items-center">
          <div aria-hidden data-ambient className="reactor-ring absolute inset-0 rounded-full" />
          <div
            aria-hidden
            className="absolute inset-5 rounded-full border border-cyan/30 bg-bg-1/80 shadow-glow-cyan backdrop-blur"
          />
          <Byte size={96} state="happy" className="relative" />
          <Bouncer size={64} state="idle" className="absolute -right-14 bottom-0 hidden sm:block" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease }}
          className="mt-10"
        >
          <SignHeading lit className="mx-auto text-[clamp(2.4rem,6vw,4.75rem)]">
            The city is dark.
          </SignHeading>
          <SignHeading className="mx-auto mt-1 text-[clamp(2.4rem,6vw,4.75rem)]">
            Your shift starts now.
          </SignHeading>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-2">
            Free while in early access. Everything runs in your browser, so the first briefing loads
            before your coffee does.
          </p>
          <div className="mt-10 flex justify-center">
            <SessionCta className="px-9 shadow-[0_0_0_1px_rgb(62_230_255/0.5),0_18px_60px_-10px_rgb(62_230_255/0.8)]" />
          </div>
        </motion.div>

        <dl className="mt-20 grid w-full grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
          {FACTS.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease }}
              className="flex flex-col-reverse bg-bg-1/90 px-5 py-6 backdrop-blur"
            >
              <dt className="mt-1 text-sm text-text-2">{f.label}</dt>
              <dd className="tabular font-display text-3xl font-bold text-text-1">{f.n}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
