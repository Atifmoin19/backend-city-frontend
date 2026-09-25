"use client";

import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";
import { useSession } from "@/features/auth/useSession";

import { UserMenu } from "./UserMenu";

/** Public-page header nav: "Log in" for visitors, map + account for signed-in engineers. */
export function HeaderSessionNav() {
  const { data: user, isPending } = useSession();
  if (isPending) return <span className="h-9 w-20" aria-hidden />;
  if (user) {
    return (
      <>
        <Link href="/map" className={buttonClasses({ variant: "ghost", size: "sm" })}>
          Open city map
        </Link>
        <UserMenu />
      </>
    );
  }
  return (
    <Link href="/login" className="text-sm font-medium text-text-2 hover:text-text-1">
      Log in
    </Link>
  );
}
