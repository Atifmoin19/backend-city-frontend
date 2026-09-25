"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface PopoverProps {
  /** Renders the trigger; spread `props` onto a <button>. */
  trigger: (props: {
    "aria-expanded": boolean;
    "aria-controls": string;
    onClick: () => void;
  }) => ReactNode;
  children: (close: () => void) => ReactNode;
  label: string;
  className?: string;
}

/** Small anchored panel (settings, account). Closes on outside click, Escape, or `close()`. */
export function Popover({ trigger, children, label, className }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      root.current?.querySelector<HTMLButtonElement>("button")?.focus();
    };
    addEventListener("pointerdown", onDown);
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("pointerdown", onDown);
      removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      {trigger({ "aria-expanded": open, "aria-controls": id, onClick: () => setOpen((o) => !o) })}
      <AnimatePresence>
        {open ? (
          <motion.div
            id={id}
            role="dialog"
            aria-label={label}
            initial={reduce ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute top-full right-0 z-50 mt-2 w-72 origin-top-right rounded-lg border border-line-strong bg-bg-2 p-2 shadow-panel",
              className,
            )}
          >
            {children(() => setOpen(false))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
