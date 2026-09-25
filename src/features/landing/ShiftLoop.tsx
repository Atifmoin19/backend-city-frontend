import { StatusLight, type Status } from "@/components/ui/StatusLight";
import { SignHeading } from "@/components/ui/SignHeading";

const SNIPPET = [
  { code: "class SignupRequest(BaseModel):", edit: false },
  { code: "    username: str = Field(min_length=3, max_length=12)", edit: true },
  { code: "    age: int = Field(ge=13, le=120)", edit: true },
];

const LOG: { method: string; body: string; status: number; state: Status }[] = [
  { method: "POST", body: '{"username": "neo_runner", "age": 25}', status: 201, state: "pass" },
  { method: "POST", body: '{"username": "tiny_tim", "age": 5}', status: 422, state: "bounce" },
  { method: "POST", body: '{"username": "x", "age": 30}', status: 422, state: "bounce" },
  { method: "POST", body: '{"username": "trinity", "age": 120}', status: 201, state: "pass" },
  { method: "POST", body: '{"username": "morpheus"}', status: 422, state: "bounce" },
];

const STEPS = [
  {
    title: "Learn",
    body: "A two-minute briefing from Byte with a diagram that moves. No walls of text.",
  },
  {
    title: "Practice",
    body: "Edit the marked lines. Your snippet runs right in the browser, as many times as you like.",
  },
  {
    title: "Checkpoint",
    body: "Hidden requests hit your server. Score 70% to unlock the next district. Retests are new variants, so you can't memorise the answers.",
  },
];

export function ShiftLoop() {
  return (
    <section
      className="border-t border-line bg-bg-0 px-5 py-24 sm:px-8 lg:py-32"
      aria-labelledby="shift-title"
    >
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div>
          <SignHeading id="shift-title" className="text-[clamp(1.9rem,4vw,3rem)]">
            One shift at the Gatehouse
          </SignHeading>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-text-2">
            Glitch is flooding the signup gate with fakes. You get two lines to fix it, and the city
            shows you right away whether it worked.
          </p>
          <ol className="relative mt-12 space-y-9 border-l border-line-strong pl-7">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative">
                <span
                  aria-hidden
                  className="absolute top-1.5 -left-[33px] size-2.5 rounded-full border border-cyan bg-bg-0 shadow-[0_0_12px_rgb(62_230_255/0.7)]"
                />
                <h3 className="font-display text-base font-semibold tracking-tight">
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.title}
                </h3>
                <p className="mt-1.5 max-w-sm leading-relaxed text-text-2">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <figure className="min-w-0 self-center">
          <div className="overflow-hidden rounded-lg border border-line bg-editor shadow-panel">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-xs text-text-3">
              <span className="font-mono">gatehouse/signup.py</span>
              <span>2 lines edited</span>
            </div>
            <pre className="overflow-x-auto px-4 py-4 font-mono text-[0.83rem] leading-7">
              {SNIPPET.map((l) => (
                <div
                  key={l.code}
                  className={
                    l.edit
                      ? "-mx-4 border-l-2 border-cyan bg-cyan/[0.06] px-[14px] text-text-1"
                      : "text-text-2"
                  }
                >
                  {l.code}
                </div>
              ))}
            </pre>
          </div>
          <div className="mt-4 rounded-lg border border-line bg-bg-2">
            <div className="border-b border-line px-4 py-2.5 text-xs text-text-3">
              Incoming traffic
            </div>
            <ul className="divide-y divide-line">
              {LOG.map((r) => (
                <li key={r.body} className="flex items-center gap-4 px-4 py-2.5 text-sm">
                  <span className="font-mono text-xs text-cyan">{r.method}</span>
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-text-2">
                    {r.body}
                  </span>
                  <StatusLight status={r.state}>
                    <span className="tabular font-mono">{r.status}</span>
                  </StatusLight>
                </li>
              ))}
            </ul>
          </div>
          <figcaption className="mt-3 text-sm text-text-3">
            Real game content from the Gatehouse; your variant will use different fields and limits.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
