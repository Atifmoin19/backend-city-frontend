import { Plus } from "lucide-react";

import { SignHeading } from "@/components/ui/SignHeading";

const FAQ = [
  { q: "Is it free?", a: "Yes, while Backend City is in early access." },
  {
    q: "Do I need to know Python?",
    a: "No. If you know JavaScript, the Academy briefing covers the Python you need in about six minutes. Complete beginners can start there too.",
  },
  {
    q: "Is it real FastAPI or a simulation?",
    a: "Real. Your snippet runs inside actual FastAPI and Pydantic, compiled to WebAssembly (Pyodide) in your browser. Checkpoints are re-graded on our server with hidden tests.",
  },
  {
    q: "What's playable today?",
    a: "Three districts: the Academy (Python for JS devs), the Signal Tower (HTTP) and the Gatehouse (validation, with a full game and checkpoint). The other seven are under construction.",
  },
  {
    q: "Does it work on mobile?",
    a: "Lessons and the map do. The coding games are best on a laptop or desktop.",
  },
  {
    q: "Where is my progress saved?",
    a: "In your browser for now, tied to your account. Syncing across devices arrives with the progress API.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      className="scroll-mt-16 border-t border-line bg-bg-1 px-5 py-24 sm:px-10 lg:px-16 lg:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SignHeading className="text-[clamp(2rem,4vw,3rem)]">
            Questions before your first shift
          </SignHeading>
          <p className="mt-4 max-w-sm text-text-2">
            Short answers. Everything here is true today, not a roadmap promise.
          </p>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium text-text-1">
                {f.q}
                <Plus
                  aria-hidden
                  className="size-5 shrink-0 text-cyan transition-transform duration-(--bc-dur-2) group-open:rotate-45"
                />
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-text-2">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
