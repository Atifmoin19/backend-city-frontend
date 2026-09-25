"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { useLogout, useSession } from "@/features/auth/useSession";

export function UserMenu() {
  const { data: user } = useSession();
  const logout = useLogout();
  const router = useRouter();
  if (!user) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-text-2 sm:inline">
        Engineer <span className="text-text-1">{user.display_name}</span>
      </span>
      <button
        type="button"
        onClick={() => logout.mutate(undefined, { onSettled: () => router.push("/") })}
        className="inline-flex size-9 items-center justify-center rounded-md border border-line text-text-2 transition-colors hover:border-line-strong hover:text-text-1"
        aria-label="Log out"
        title="Log out"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
}
