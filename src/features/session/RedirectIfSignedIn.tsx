"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useSession } from "@/features/auth/useSession";
import { hasOnboarded } from "@/features/progress/legacy";

/**
 * Visitors who were ALREADY signed in when they opened /login or /signup go back into the
 * city. A login that happens on this page is handled by the form itself (no double redirect).
 */
export function RedirectIfSignedIn() {
  const { data: user, isPending } = useSession();
  const router = useRouter();
  const initial = useRef<"unknown" | "signed-in" | "visitor">("unknown");
  useEffect(() => {
    if (isPending || initial.current !== "unknown") return;
    initial.current = user ? "signed-in" : "visitor";
    if (user) router.replace(hasOnboarded(user) ? "/map" : "/welcome");
  }, [user, isPending, router]);
  return null;
}
