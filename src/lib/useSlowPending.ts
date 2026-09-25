"use client";

import { useEffect, useState } from "react";

/** True when a request has been pending longer than `ms` (likely a backend cold start). */
export function useSlowPending(pending: boolean, ms = 2500): boolean {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!pending) return;
    const id = setTimeout(() => setSlow(true), ms);
    return () => {
      clearTimeout(id);
      setSlow(false);
    };
  }, [pending, ms]);
  return pending && slow;
}
