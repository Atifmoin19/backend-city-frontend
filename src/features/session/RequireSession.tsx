"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Byte } from "@/components/characters/Byte";
import { useSession } from "@/features/auth/useSession";

/**
 * Client-side gate (the refresh cookie is scoped to /api/auth, so a server check on page routes
 * can't see it). Real authorization is enforced by the backend on every API call.
 */
export function RequireSession({ children }: { children: ReactNode }) {
  const { data, isPending, isError } = useSession();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    if (!isPending && !isError && data === null)
      router.replace(`/login?next=${encodeURIComponent(path)}`);
  }, [data, isPending, isError, router, path]);

  if (isPending || data === null) {
    return (
      <div className="grid min-h-[60dvh] place-items-center" role="status">
        <div className="flex flex-col items-center gap-3 text-text-2">
          <Byte state="thinking" size={64} />
          Checking your badge…
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
