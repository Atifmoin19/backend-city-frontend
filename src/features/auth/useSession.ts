"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApi, type Credentials } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import type { UserPublic } from "@/lib/api/types";

export const SESSION_KEY = ["session"] as const;

/** Current user or null. On an expired access token, tries one refresh (rotation) first. */
async function fetchSession(): Promise<UserPublic | null> {
  try {
    return await authApi.me();
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) throw err;
  }
  try {
    return (await authApi.refresh()).user;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

export function useSession() {
  return useQuery({
    queryKey: SESSION_KEY,
    queryFn: fetchSession,
    staleTime: 60_000,
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Credentials) => authApi.login(body),
    onSuccess: ({ user }) => qc.setQueryData(SESSION_KEY, user),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Credentials & { display_name: string }) => authApi.register(body),
    onSuccess: ({ user }) => qc.setQueryData(SESSION_KEY, user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => qc.setQueryData(SESSION_KEY, null),
  });
}
