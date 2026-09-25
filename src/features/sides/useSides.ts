"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SIDES, type Side } from "@/content/sides";
import { useSession } from "@/features/auth/useSession";
import { tracksApi } from "@/lib/api/tracks";

export interface SideState extends Side {
  open: boolean;
  /** Signed-in learner already asked to be notified. */
  notified: boolean;
}

const INTERESTS = (userId: string | undefined) => ["interests", userId ?? "guest"] as const;

/** The three sides with live status (open / coming soon) and the learner's Notify me state. */
export function useSides() {
  const qc = useQueryClient();
  const { data: user } = useSession();
  const tracks = useQuery({
    queryKey: ["tracks"],
    queryFn: tracksApi.list,
    staleTime: 5 * 60_000,
  });
  const interests = useQuery({
    queryKey: INTERESTS(user?.id),
    queryFn: tracksApi.interests,
    enabled: !!user,
  });
  const notifyMe = useMutation({
    mutationFn: (track: string) => tracksApi.notifyMe(track),
    onSuccess: (data) => qc.setQueryData(INTERESTS(user?.id), data),
  });

  const sides: SideState[] = SIDES.map((side) => {
    const live = tracks.data?.find((t) => t.slug === side.track);
    return {
      ...side,
      open: (live?.status ?? side.fallbackStatus) === "open",
      notified: !!interests.data?.tracks.includes(side.track),
    };
  });
  return { sides, signedIn: !!user, notifyMe };
}
