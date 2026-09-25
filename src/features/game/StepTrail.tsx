import { Check, Lock } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/cn";

type StepState = "done" | "current" | "locked" | "open";

interface Step {
  label: string;
  href?: string;
  state: StepState;
}

const SR: Record<StepState, string> = {
  done: " (done)",
  current: " (you are here)",
  locked: " (locked)",
  open: "",
};

/** Briefing → Practice → Checkpoint as quiet text, so the learner knows where they stand. */
export function StepTrail({ steps }: { steps: Step[] }) {
  return (
    <ol aria-label="Topic steps" className="flex items-center gap-2 text-xs">
      {steps.map((s, i) => {
        const body = (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 py-1",
              s.state === "current" && "font-semibold text-text-1",
              s.state === "done" && "text-green",
              s.state === "open" && "text-text-2",
              s.state === "locked" && "text-text-3",
            )}
          >
            {s.state === "done" ? <Check aria-hidden className="size-3.5" /> : null}
            {s.state === "locked" ? <Lock aria-hidden className="size-3" /> : null}
            {s.state === "current" ? (
              <span aria-hidden className="size-1.5 rounded-full bg-cyan" />
            ) : null}
            {s.label}
            <span className="sr-only">{SR[s.state]}</span>
          </span>
        );
        return (
          <li key={s.label} className="flex items-center gap-2">
            {i > 0 ? (
              <span aria-hidden className="text-text-3">
                /
              </span>
            ) : null}
            {s.href && s.state !== "current" && s.state !== "locked" ? (
              <Link href={s.href} className="hover:text-text-1 hover:underline">
                {body}
              </Link>
            ) : (
              <span aria-current={s.state === "current" ? "step" : undefined}>{body}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
