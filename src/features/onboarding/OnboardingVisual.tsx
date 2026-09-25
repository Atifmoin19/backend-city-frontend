"use client";

import { Byte } from "@/components/characters/Byte";
import { Bouncer } from "@/components/characters/Bouncer";
import { StatusLight } from "@/components/ui/StatusLight";
import { SkylineCanvas } from "@/features/landing/skyline/SkylineCanvas";
import { GateTraffic } from "@/features/lesson/diagrams/GateTraffic";

import type { Slide } from "./slides";

/** Right-hand stage for each onboarding slide. */
export function OnboardingVisual({ visual }: { visual: Slide["visual"] }) {
  if (visual === "skyline") {
    return (
      <div className="relative size-full">
        <SkylineCanvas className="absolute inset-0 size-full" />
        <div className="absolute bottom-8 left-8 flex items-end gap-3">
          <Byte size={88} state="happy" />
          <p className="mb-6 rounded-md border border-purple/40 bg-(--bc-byte-bubble) px-4 py-2.5 text-sm text-text-1">
            I&apos;m Byte. I&apos;ll be in your corner the whole way.
          </p>
        </div>
      </div>
    );
  }
  if (visual === "loop") {
    return (
      <div className="grid size-full place-items-center p-10">
        <div className="w-full max-w-lg rounded-lg border border-line bg-bg-1 p-6">
          <GateTraffic />
          <div className="mt-4 flex items-center justify-between text-sm">
            <StatusLight status="pass">Real recruits get in</StatusLight>
            <StatusLight status="bounce">Fakes bounce</StatusLight>
          </div>
        </div>
      </div>
    );
  }
  if (visual === "lights") {
    return (
      <div className="grid size-full place-items-center p-10">
        <ul className="w-full max-w-md divide-y divide-line overflow-hidden rounded-lg border border-line bg-bg-1 font-mono text-sm">
          {[
            { m: "POST /signup", s: 201, st: "pass" as const },
            { m: "POST /signup", s: 422, st: "bounce" as const },
            { m: "GET /users/7", s: 200, st: "pass" as const },
            { m: "POST /orders", s: 500, st: "crash" as const },
          ].map((r, i) => (
            <li key={i} className="flex items-center justify-between px-4 py-3">
              <span className="text-text-2">
                <span className="text-cyan">{r.m.split(" ")[0]}</span> {r.m.split(" ")[1]}
              </span>
              <StatusLight status={r.st}>{r.s}</StatusLight>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="grid size-full place-items-center p-10">
      <div className="flex items-end gap-6">
        <Bouncer size={120} state="happy" />
        <Byte size={96} state="celebrating" />
      </div>
    </div>
  );
}
