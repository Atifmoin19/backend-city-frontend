"use client";

import { SignHeading } from "@/components/ui/SignHeading";
import { StatusLight } from "@/components/ui/StatusLight";

import { RequestRelay } from "./relay/RequestRelay";

/** "You know this end. Learn the other one." An interactive request relay, fetch() to FastAPI. */
export function FetchBridge() {
  return (
    <section
      id="how"
      className="relative scroll-mt-16 overflow-hidden bg-bg-0 px-5 py-28 sm:px-10 lg:px-16 lg:py-36"
    >
      <div
        aria-hidden
        className="city-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,black,transparent)] opacity-50"
      />
      <div
        aria-hidden
        className="absolute top-1/3 -left-32 size-[30rem] rounded-full bg-cyan/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-32 bottom-10 size-[28rem] rounded-full bg-purple/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl">
        <SignHeading className="max-w-3xl text-[clamp(2rem,4.6vw,3.6rem)]">
          You know this end. Now learn the other one.
        </SignHeading>
        <p className="mt-5 max-w-2xl text-lg text-text-2">
          Every lesson in Backend City starts from something you already write in the browser, and
          follows the request to the server that answers it.
        </p>

        <div className="relative mt-14 rounded-2xl border border-line bg-bg-1/70 p-4 shadow-panel backdrop-blur-sm sm:p-6 lg:p-8">
          <RequestRelay />
        </div>

        <ul className="mt-16 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
          {[
            {
              s: "flow" as const,
              t: "Real FastAPI",
              b: "Actual Python and Pydantic running in your browser through WebAssembly. No install.",
            },
            {
              s: "pass" as const,
              t: "Learn, practice, prove",
              b: "A short briefing, unlimited practice, then a checkpoint with hidden requests.",
            },
            {
              s: "ai" as const,
              t: "A tutor, not an answer key",
              b: "Byte gives tiered hints. It never hands you the solution during a checkpoint.",
            },
          ].map((f) => (
            <li key={f.t} className="bg-bg-1 px-6 py-6">
              <StatusLight status={f.s}>{f.t}</StatusLight>
              <p className="mt-2 text-text-2">{f.b}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
