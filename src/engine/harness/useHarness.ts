"use client";

import { useEffect, useState } from "react";

import { HarnessClient, type HarnessStatus } from "./HarnessClient";

let shared: HarnessClient | null = null;

/** One worker per tab, booted as soon as a game screen mounts. */
export function useHarness(): { client: HarnessClient; status: HarnessStatus } {
  const [client] = useState(() => (shared ??= new HarnessClient()));
  const [status, setStatus] = useState<HarnessStatus>({ state: "idle" });
  useEffect(() => {
    const off = client.subscribe(setStatus);
    void client.boot().catch(() => {});
    return () => {
      off();
    };
  }, [client]);
  return { client, status };
}
