"use client";

import { Building2, Map, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { PreferenceToggles } from "@/components/ui/PreferenceToggles";
import { cityStats } from "@/features/progress/stats";
import { RequireSession } from "@/features/session/RequireSession";
import { UserMenu } from "@/features/session/UserMenu";
import { cn } from "@/lib/cn";
import { useLearning } from "@/stores/learning";

import { Wordmark } from "./Wordmark";

const NAV = [{ href: "/map", label: "City map", icon: Map }];

/** Shell for every signed-in screen: one top bar, real stats, account menu. */
export function AppShell({ children, bleed = false }: { children: ReactNode; bleed?: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-0">
      <AppBar />
      <main className={cn("flex-1", !bleed && "pb-16")}>
        <RequireSession>{children}</RequireSession>
      </main>
    </div>
  );
}

function AppBar() {
  const path = usePathname();
  const { records } = useLearning();
  const stats = cityStats(records);
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg-1/90 backdrop-blur-md">
      <div className="flex h-16 items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Wordmark />
        <nav aria-label="App" className="hidden items-center gap-1 md:flex">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              path === href ||
              (href === "/map" && (path.startsWith("/district") || path.startsWith("/learn")));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                  active ? "bg-bg-3 text-text-1" : "text-text-2 hover:bg-bg-2 hover:text-text-1",
                )}
              >
                <Icon aria-hidden className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <dl className="hidden items-center gap-2 lg:flex">
            <StatChip
              icon={<Building2 aria-hidden className="size-4 text-green" />}
              label="Districts cleared"
            >
              {stats.districtsCleared}/{stats.districtsTotal}{" "}
              <span className="font-normal text-text-2">districts</span>
            </StatChip>
            <StatChip
              icon={<Star aria-hidden className="size-4 fill-amber text-amber" />}
              label="Stars"
            >
              {stats.stars} <span className="font-normal text-text-2">stars</span>
            </StatChip>
          </dl>
          <UserMenu />
          <PreferenceToggles />
        </div>
      </div>
    </header>
  );
}

function StatChip({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className="flex h-9 items-center gap-2 rounded-md border border-line bg-bg-2 px-3 text-sm"
      title={label}
    >
      {icon}
      <dt className="sr-only">{label}</dt>
      <dd className="tabular font-semibold text-text-1">{children}</dd>
    </div>
  );
}
