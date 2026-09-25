import { AlertTriangle, Check, Loader2, Lock, Sparkles, X, Zap } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type Status = "flow" | "pass" | "bounce" | "crash" | "ai" | "locked" | "busy";

/** One source of truth for what each status looks like. Color never travels alone. */
export const STATUS_META: Record<
  Status,
  { color: string; ring: string; icon: typeof Check; label: string }
> = {
  flow: { color: "text-cyan", ring: "bg-cyan", icon: Zap, label: "Request" },
  pass: { color: "text-green", ring: "bg-green", icon: Check, label: "Passed" },
  bounce: { color: "text-amber", ring: "bg-amber", icon: AlertTriangle, label: "Bounced" },
  crash: { color: "text-red", ring: "bg-red", icon: X, label: "Crashed" },
  ai: { color: "text-purple", ring: "bg-purple", icon: Sparkles, label: "Byte" },
  locked: { color: "text-text-3", ring: "bg-text-3", icon: Lock, label: "Locked" },
  busy: { color: "text-cyan", ring: "bg-cyan", icon: Loader2, label: "Running" },
};

interface StatusLightProps {
  status: Status;
  children?: ReactNode;
  className?: string;
  /** Show the icon (default) in addition to the LED. */
  iconOnly?: boolean;
}

/** LED + icon + label. Use anywhere a state is shown. */
export function StatusLight({ status, children, className, iconOnly }: StatusLightProps) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-sm font-medium", meta.color, className)}
    >
      <Icon aria-hidden className={cn("size-4 shrink-0", status === "busy" && "animate-spin")} />
      {iconOnly ? (
        <span className="sr-only">{children ?? meta.label}</span>
      ) : (
        (children ?? meta.label)
      )}
    </span>
  );
}

/** Tiny LED dot for dense places. Always pair with visible text nearby. */
export function Led({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-2 rounded-full shadow-[0_0_10px_currentColor]",
        STATUS_META[status].ring,
        STATUS_META[status].color,
        className,
      )}
    />
  );
}
