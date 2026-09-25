"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { Kbd } from "@/components/ui/Kbd";
import { cn } from "@/lib/cn";

interface TrafficModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Short live summary, e.g. "2/3 requests correct". */
  summary: ReactNode;
  /** The simulation stage. Stays mounted while closed so the Pixi scene never restarts. */
  stage: ReactNode;
  log: ReactNode;
  /** Optional next move, e.g. "Take the checkpoint" once practice clears. */
  action?: ReactNode;
}

/**
 * Full-view traffic replay. Opens when the learner runs requests so the whole simulation is
 * visible, then closes back to the code. Always mounted; hidden with `inert` when closed.
 */
export function TrafficModal({
  open,
  onClose,
  title,
  summary,
  stage,
  log,
  action,
}: TrafficModalProps) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
    };
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("keydown", onKey);
      if (opener.current instanceof HTMLElement) opener.current.focus();
    };
  }, [open]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="traffic-title"
      inert={!open}
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-40 grid place-items-center p-3 transition-[opacity,visibility] duration-(--bc-dur-3) ease-out sm:p-6",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-bg-0/75 backdrop-blur-sm"
      />
      <div
        className={cn(
          "relative flex h-[min(88dvh,820px)] w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-line-strong bg-bg-1 shadow-panel transition-transform duration-(--bc-dur-3) ease-out",
          open ? "scale-100" : "scale-[0.97]",
        )}
      >
        <div className="flex items-center gap-4 border-b border-line px-5 py-3">
          <h2 id="traffic-title" className="text-sm font-semibold text-text-1">
            {title}
          </h2>
          <div className="text-sm">{summary}</div>
          <span className="ml-auto hidden text-xs text-text-3 lg:inline">
            <Kbd>Esc</Kbd> back to code
          </span>
          {action}
          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            className="plate-ghost inline-flex h-9 items-center gap-2 rounded-md border border-line-strong px-3 text-sm font-medium text-text-1 hover:border-cyan/60 hover:text-cyan"
          >
            <X aria-hidden className="size-4" /> Back to code
          </button>
        </div>
        <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto]">
          <div className="relative min-h-0 [background:var(--bc-viz-stage)]">{stage}</div>
          <div className="border-t border-line p-3 sm:p-4">{log}</div>
        </div>
      </div>
    </div>
  );
}
