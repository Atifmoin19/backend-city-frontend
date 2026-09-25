"use client";

import { motion } from "motion/react";

import { SignHeading } from "@/components/ui/SignHeading";
import { StatusLight } from "@/components/ui/StatusLight";
import { useReducedMotion } from "@/lib/useReducedMotion";

const CLIENT = `const res = await fetch("/api/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "neo", age: 5 }),
});

res.status; // 422`;

const SERVER = `class SignupRequest(BaseModel):
    username: str = Field(min_length=3)
    age: int = Field(ge=13, le=120)

@app.post("/signup", status_code=201)
async def signup(body: SignupRequest):
    return {"welcome": body.username}`;

/** "You know this end. Learn that end." Two real code panels with a request crossing between. */
export function FetchBridge() {
  const reduced = useReducedMotion();
  return (
    <section
      id="how"
      className="relative scroll-mt-16 overflow-hidden bg-bg-0 px-5 py-28 sm:px-10 lg:px-16 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <SignHeading className="max-w-3xl text-[clamp(2rem,4.6vw,3.6rem)]">
          You know this end. Now learn the other one.
        </SignHeading>
        <p className="mt-5 max-w-2xl text-lg text-text-2">
          Every lesson in Backend City starts from something you already write in the browser, and
          follows the request to the server that answers it.
        </p>

        <div className="relative mt-16 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <CodeCard label="Your frontend" file="signup.ts" code={CLIENT} />
          <div className="relative flex items-center justify-center lg:h-full lg:w-40">
            <div
              aria-hidden
              className="h-16 w-px bg-gradient-to-b from-cyan/0 via-cyan/70 to-cyan/0 lg:h-px lg:w-full lg:bg-gradient-to-r"
            />
            {!reduced ? (
              <>
                <motion.span
                  aria-hidden
                  className="absolute size-3 rounded-full bg-cyan shadow-[0_0_18px_4px_rgb(62_230_255/0.7)]"
                  animate={{ x: ["-4.5rem", "4.5rem"], opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    repeatDelay: 1.6,
                    ease: "easeInOut",
                  }}
                />
                <motion.span
                  aria-hidden
                  className="absolute size-3 rounded-full bg-amber shadow-[0_0_18px_4px_rgb(255_181_71/0.7)]"
                  animate={{ x: ["4.5rem", "-4.5rem"], opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: 1.6,
                    delay: 1.6,
                    repeat: Infinity,
                    repeatDelay: 1.6,
                    ease: "easeInOut",
                  }}
                />
              </>
            ) : null}
            <span className="absolute top-full mt-3 text-center font-mono text-xs whitespace-nowrap text-text-3 lg:top-auto lg:-bottom-10">
              POST /signup → 422
            </span>
          </div>
          <CodeCard label="Your server (you'll write this)" file="signup.py" code={SERVER} glow />
        </div>

        <ul className="mt-20 grid gap-8 sm:grid-cols-3">
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
            <li key={f.t}>
              <StatusLight status={f.s}>{f.t}</StatusLight>
              <p className="mt-2 text-text-2">{f.b}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CodeCard({
  label,
  file,
  code,
  glow,
}: {
  label: string;
  file: string;
  code: string;
  glow?: boolean;
}) {
  return (
    <figure
      className={`overflow-hidden rounded-xl border bg-editor ${glow ? "border-cyan/40 shadow-glow-cyan" : "border-line shadow-panel"}`}
    >
      <figcaption className="flex items-center justify-between border-b border-line px-4 py-2.5 text-xs">
        <span className="text-text-2">{label}</span>
        <span className="font-mono text-text-3">{file}</span>
      </figcaption>
      <pre className="overflow-x-auto p-4 font-mono text-[0.82rem] leading-6 text-text-1">
        {code}
      </pre>
    </figure>
  );
}
