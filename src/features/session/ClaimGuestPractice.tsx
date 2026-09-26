"use client";

import { useEffect } from "react";

import { useSession } from "@/features/auth/useSession";
import { useLearning } from "@/features/progress/useLearning";

import { takeGuestWins } from "./guestPractice";

/** Once signed in, saves practice cleared as a guest to the account (renders nothing). */
export function ClaimGuestPractice() {
  const { data: user } = useSession();
  const { recordPractice } = useLearning();
  const { mutate } = recordPractice;
  useEffect(() => {
    if (!user) return;
    for (const win of takeGuestWins()) {
      mutate({ slug: win.slug, token: win.token, passed: true, score: 100 });
    }
  }, [user, mutate]);
  return null;
}
