import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

interface SignHeadingProps {
  as?: ElementType;
  id?: string;
  children: ReactNode;
  className?: string;
  /** Lit signage gradient. Reserve for the one display heading per screen. */
  lit?: boolean;
}

/** Wide sign-plate display type (Unbounded). */
export function SignHeading({ as: Tag = "h2", id, children, className, lit }: SignHeadingProps) {
  return (
    <Tag
      id={id}
      className={cn(
        "font-display font-bold tracking-[-0.02em] text-text-1",
        lit && "sign-text w-fit",
        className,
        // last: twMerge drops leading-* when a text-[size] class follows it
        "leading-[1.04]",
      )}
    >
      {children}
    </Tag>
  );
}
