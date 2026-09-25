"use client";

import { SettingsMenu } from "@/components/ui/SettingsMenu";
import { useSession } from "@/features/auth/useSession";

import { UserMenu } from "./UserMenu";

/** Right edge of every header: account menu when signed in, settings for visitors. */
export function SessionMenu() {
  const { data: user, isPending } = useSession();
  if (isPending) return <span className="h-9 w-9" aria-hidden />;
  return user ? <UserMenu /> : <SettingsMenu />;
}
