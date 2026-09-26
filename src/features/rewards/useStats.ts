"use client";

import { useQuery } from "@tanstack/react-query";

import { useSession } from "@/features/auth/useSession";
import { statsApi } from "@/lib/api/stats";

export const STATS_KEY = ["stats"] as const;

const timeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

/** XP, level, streak and badges (derived on the server). Refetched after anything that earns. */
export function useStats() {
  const { data: user } = useSession();
  return useQuery({
    queryKey: [...STATS_KEY, user?.id ?? "guest"],
    queryFn: () => statsApi.get(timeZone()),
    enabled: !!user,
    staleTime: 60_000,
  });
}
