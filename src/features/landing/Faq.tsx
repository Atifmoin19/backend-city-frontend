"use client";

import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { SignHeading } from "@/components/ui/SignHeading";
import { StatusLight } from "@/components/ui/StatusLight";
import { cn } from "@/lib/cn";

const FAQ = [
  { path: "is-it-free", q: "Is it free?", a: "Yes, while Full Stack City is in early access." },
  {
    path: "need-python",
    q: "Do I need to know Python?",
    a: "No. If you know JavaScript, the Academy briefing covers the Python you need in about six minutes. Complete beginners can start there too.",
  },
  {
    path: "real-fastapi",
    q: "Is it real FastAPI or a simulation?",
    a: "Real. Your snippet runs inside actual FastAPI and Pydantic, compiled to WebAssembly (Pyodide) in your browser. Checkpoints are re-graded on our server with hidden tests.",
  },
  {
    path: "playable-today",
    q: "What's playable today?",
    a: "Three districts: the Academy (Python for JS devs), the Signal Tower (HTTP) and the Gatehouse (validation, with a full game and checkpoint). The other seven are under construction.",
  },
  {
    path: "mobile",
    q: "Does it work on mobile?",
    a: "Lessons and the map do. The coding games are best on a laptop or desktop.",
  },
  {
    path: "progress",
    q: "Where is my progress saved?",
    a: "In your browser for now, tied to your account. Syncing across devices arrives with the progress API.",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

/** FAQ as the city's own API: every question is a request, every answer a 200 response. */
export function Faq() {
  const [open, setOpen] = useState(0);
  const [log, setLog] = useState<string[]>([FAQ[0]!.path]);
  const toggle = (i: number) => {
    setOpen((o) => (o === i ? -1 : i));
    setLog((l) => [FAQ[i]!.path, ...l].slice(0, 6));
  };

  return (
    <section
      id="faq"
      className="relative scroll-mt-16 overflow-hidden border-t border-line bg-bg-1 px-3 py-14 sm:px-10 sm:py-24 lg:px-16 lg:py-32"
    >
      <div
        aria-hidden
        className="absolute -top-40 -left-40 size-[36rem] rounded-full bg-purple/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-40 -bottom-40 size-[32rem] rounded-full bg-cyan/10 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-xs text-cyan">GET /faq</p>
          <SignHeading className="mt-3 text-[clamp(2rem,4vw,3.2rem)]">
            Questions before your first shift
          </SignHeading>
          <p className="mt-4 max-w-sm text-text-2">
            Ask the city. Every answer here is true today, not a roadmap promise.
          </p>
          {/* live request console */}
          <div className="mt-8 hidden overflow-hidden rounded-xl border border-line bg-editor shadow-panel lg:block">
            <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-red/70" />
              <span className="size-2.5 rounded-full bg-amber/70" />
              <span className="size-2.5 rounded-full bg-green/70" />
              <span className="ml-3 font-mono text-xs text-text-3">city.log</span>
            </div>
            <ul className="space-y-1.5 px-4 py-3 font-mono text-xs" aria-live="polite">
              <AnimatePresence initial={false}>
                {log.map((path, i) => (
                  <motion.li
                    key={`${path}-${log.length - i}`}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1 - i * 0.14, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease }}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="truncate text-text-2">
                      <span className="text-cyan">GET</span> /faq/{path}
                    </span>
                    <span className="text-green">200 OK</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.path}>
                <div
                  className={cn(
                    "overflow-hidden rounded-xl border transition-[border-color,box-shadow,background-color] duration-(--bc-dur-3)",
                    isOpen
                      ? "border-cyan/50 bg-bg-2 shadow-glow-cyan"
                      : "border-line bg-bg-0/40 hover:border-line-strong",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${f.path}`}
                    className="flex w-full items-center gap-3 px-3.5 py-3.5 text-left sm:gap-4 sm:px-5 sm:py-4"
                  >
                    <span className="rounded-sm border border-cyan/40 bg-cyan/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-cyan">
                      GET
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-medium text-text-1 sm:text-lg">
                        {f.q}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-xs text-text-3">
                        /faq/{f.path}
                      </span>
                    </span>
                    <ChevronRight
                      aria-hidden
                      className={cn(
                        "size-5 shrink-0 text-text-3 transition-transform duration-(--bc-dur-2)",
                        isOpen && "rotate-90 text-cyan",
                      )}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        id={`faq-${f.path}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease }}
                        className="overflow-hidden"
                      >
                        {/* Padding, not margin: a collapsing margin escapes the measured height */}
                        <div className="px-3.5 pb-4 sm:px-5 sm:pb-5">
                          <div className="rounded-lg border border-line bg-editor">
                            <div className="flex items-center justify-between border-b border-line px-4 py-2 text-xs">
                              <StatusLight status="pass" className="text-xs">
                                200 OK
                              </StatusLight>
                              <span className="font-mono text-text-3">application/answer</span>
                            </div>
                            <p className="px-4 py-3.5 leading-relaxed text-text-1">{f.a}</p>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
