"use client";

import { Map } from "lucide-react";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";
import { SettingsMenu } from "@/components/ui/SettingsMenu";
import { useSession } from "@/features/auth/useSession";

import { UserMenu } from "./UserMenu";

/** Public-page header nav: log in / sign up + settings for visitors, map + account for engineers. */
export function HeaderSessionNav() {
  const { data: user, isPending } = useSession();
  if (isPending) return <span className="h-9 w-20" aria-hidden />;
  if (user) {
    return (
      <>
        <Link href="/map" className={buttonClasses({ variant: "ghost", size: "sm" })}>
          <Map aria-hidden className="size-4" />
          {/* phones: icon only, so the wordmark keeps its single line */}
          <span className="sr-only sm:not-sr-only">Open city map</span>
        </Link>
        <UserMenu />
      </>
    );
  }
  return (
    <>
      <Link
        href="/login"
        className="px-2 text-sm font-medium text-text-2 transition-colors hover:text-text-1"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className={buttonClasses({ size: "sm", className: "hidden sm:inline-flex" })}
      >
        Sign up free
      </Link>
      <SettingsMenu />
    </>
  );
}
