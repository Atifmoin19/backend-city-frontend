"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SIDES, type Side } from "@/content/sides";
import { SESSION_KEY, useSession } from "@/features/auth/useSession";
import { tracksApi } from "@/lib/api/tracks";
import type { UserPublic } from "@/lib/api/types";

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

/** Save the learner's side (PUT /me/goal). A coming-soon side also records Notify me. */
export function useChooseGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (track: string) => tracksApi.chooseGoal(track),
    onSuccess: (user) => {
      qc.setQueryData<UserPublic | null>(SESSION_KEY, user);
      void qc.invalidateQueries({ queryKey: ["interests"] });
    },
  });
}
