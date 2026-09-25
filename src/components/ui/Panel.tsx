import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  /** glass: only for panels floating over a moving scene (map, visualizer). */
  surface?: "solid" | "glass" | "editor";
}

export function Panel({ surface = "solid", className, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-lg",
        surface === "solid" && "border border-line bg-bg-2 shadow-panel",
        surface === "glass" && "glass shadow-panel",
        surface === "editor" && "border border-line bg-editor",
        className,
      )}
      {...props}
    />
  );
}
