import { ArrowRight } from "lucide-react";

const STAGES = [
  { label: "JSON body", detail: '{"age": "old"}', tone: "text-cyan border-cyan/50" },
  { label: "SignupRequest model", detail: "types checked", tone: "text-amber border-amber/50" },
  { label: "your handler", detail: "only runs if valid", tone: "text-green border-green/50" },
];

/** JSON -> model -> handler, with the 422 exit at the model. */
export function RequestPipeline() {
  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
      role="img"
      aria-label="The JSON body is parsed into the model before the handler runs. Invalid data exits with 422 at the model."
    >
      {STAGES.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3 sm:flex-1">
          <div className={`flex-1 rounded-md border bg-bg-1 px-3 py-2.5 ${s.tone}`}>
            <p className="text-sm font-semibold">{s.label}</p>
            <p className="font-mono text-xs text-text-2">{s.detail}</p>
            {i === 1 ? (
              <p className="mt-1 text-xs text-amber">invalid → 422, handler skipped</p>
            ) : null}
          </div>
          {i < STAGES.length - 1 ? (
            <ArrowRight aria-hidden className="hidden size-4 shrink-0 text-text-3 sm:block" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
