"use client";

import { ChevronDown, LogOut, Map } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Popover } from "@/components/ui/Popover";
import { SettingsRows } from "@/components/ui/SettingsRows";
import { useLogout, useSession } from "@/features/auth/useSession";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

/** Account menu: who you are, settings, log out. Everything labeled. */
export function UserMenu() {
  const { data: user } = useSession();
  const logout = useLogout();
  const router = useRouter();
  if (!user) return null;
  return (
    <Popover
      label="Account"
      trigger={(props) => (
        <button
          type="button"
          {...props}
          className="plate-ghost inline-flex h-9 items-center gap-2 rounded-full border border-line-strong py-1 pr-2.5 pl-1 text-sm text-text-1 transition-colors hover:border-cyan/50"
        >
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-cyan to-purple font-display text-[0.65rem] font-bold text-on-neon"
          >
            {initials(user.display_name)}
          </span>
          <span className="hidden max-w-36 truncate font-medium sm:inline">
            {user.display_name}
          </span>
          <span className="sr-only">Account menu</span>
          <ChevronDown aria-hidden className="size-4 text-text-3" />
        </button>
      )}
    >
      {(close) => (
        <>
          <div className="flex items-center gap-3 px-2.5 pt-2 pb-3">
            <span
              aria-hidden
              className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-cyan to-purple font-display text-xs font-bold text-on-neon"
            >
              {initials(user.display_name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-text-1">
                {user.display_name}
              </span>
              <span className="block truncate text-xs text-text-3">{user.email}</span>
            </span>
          </div>
          <div className="border-t border-line pt-1">
            <Link
              href="/map"
              onClick={close}
              className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-text-1 hover:bg-bg-3/70"
            >
              <Map aria-hidden className="size-4 text-cyan" /> City map
            </Link>
          </div>
          <div className="mt-1 border-t border-line pt-1">
            <p className="px-2.5 pt-2 pb-1 text-[0.7rem] font-semibold tracking-[0.12em] text-text-3 uppercase">
              Settings
            </p>
            <SettingsRows />
          </div>
          <div className="mt-1 border-t border-line pt-1">
            <button
              type="button"
              onClick={() => logout.mutate(undefined, { onSettled: () => router.push("/") })}
              className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm text-text-1 hover:bg-bg-3/70"
            >
              <LogOut aria-hidden className="size-4 text-text-3" /> Log out
            </button>
          </div>
        </>
      )}
    </Popover>
  );
}
