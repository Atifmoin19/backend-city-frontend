import { SignHeading } from "@/components/ui/SignHeading";
import { DISTRICTS } from "@/content/districts";

/** The curriculum drawn as a transit line: every stop is a district, every district a skill. */
export function DistrictLine() {
  return (
    <section className="px-5 py-24 sm:px-8 lg:py-32" aria-labelledby="line-title">
      <div className="mx-auto max-w-6xl">
        <SignHeading id="line-title" className="max-w-2xl text-[clamp(1.9rem,4vw,3rem)]">
          Ten districts from zero to job-ready
        </SignHeading>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-2">
          Each district teaches one layer of the backend. Clear one and its lights come back on.
        </p>
        <ol className="mt-16 grid gap-x-10 gap-y-0 md:grid-cols-2">
          {DISTRICTS.map((d) => (
            <li key={d.key} className="group relative flex gap-5 pb-9">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden
                  className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-line-strong bg-bg-1 font-mono text-xs text-text-2 transition-colors group-hover:border-cyan group-hover:text-cyan"
                >
                  {d.level}
                </span>
                <span aria-hidden className="mt-2 w-px flex-1 bg-line" />
              </div>
              <div className="pt-1">
                <h3 className="font-display text-[0.95rem] font-semibold tracking-tight">
                  <span className="sr-only">Level {d.level}: </span>
                  {d.name}
                  {d.optional ? (
                    <span className="ml-2 font-sans text-xs font-normal text-text-3">optional</span>
                  ) : null}
                </h3>
                <p className="mt-1 text-text-2">{d.teaches}</p>
                <p className="mt-1.5 text-sm text-text-3">{d.topics.join(" · ")}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
