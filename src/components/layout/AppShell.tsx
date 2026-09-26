"use client";

import { Building2, Flame, Map, Star, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cityStats } from "@/features/progress/stats";
import { BadgeToaster } from "@/features/rewards/BadgeToaster";
import { useStats } from "@/features/rewards/useStats";
import { ClaimGuestPractice } from "@/features/session/ClaimGuestPractice";
import { RequireSession } from "@/features/session/RequireSession";
import { VerifyBanner } from "@/features/session/VerifyBanner";
import { UserMenu } from "@/features/session/UserMenu";
import { cn } from "@/lib/cn";
import { useLearning } from "@/features/progress/useLearning";

import { Wordmark } from "./Wordmark";

const NAV = [{ href: "/map", label: "Backend District", icon: Map }];

/** Shell for every signed-in screen: one top bar, real stats, account menu. */
export function AppShell({ children, bleed = false }: { children: ReactNode; bleed?: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-0">
      <AppBar />
      <VerifyBanner />
      <main className={cn("flex-1", !bleed && "pb-16")}>
        <RequireSession>{children}</RequireSession>
      </main>
      <BadgeToaster />
      <ClaimGuestPractice />
    </div>
  );
}

function AppBar() {
  const path = usePathname();
  const { records } = useLearning();
  const stats = cityStats(records);
  const { data: rewards } = useStats();
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
          {rewards ? (
            <Link
              href="/badges"
              className="plate-ghost flex h-9 items-center gap-2 rounded-full border border-line-strong px-3 text-sm"
              aria-label={`Level ${rewards.level.level}, ${rewards.xp} XP, ${rewards.streak.current}-day streak. Badges and XP`}
            >
              <Zap aria-hidden className="size-4 text-cyan" />
              <span className="tabular font-semibold text-text-1">Lv {rewards.level.level}</span>
              <span className="hidden text-text-2 xl:inline">{rewards.xp} XP</span>
              <Flame
                aria-hidden
                className={cn("size-4", rewards.streak.current ? "text-amber" : "text-text-3")}
              />
              <span className="tabular font-semibold text-text-1">{rewards.streak.current}</span>
            </Link>
          ) : null}
          <dl className="hidden items-center gap-2 lg:flex">
            <StatChip
              icon={<Building2 aria-hidden className="size-4 text-green" />}
              label="Districts cleared"
            >
              {stats.districtsCleared}/{stats.districtsTotal}{" "}
              <span className="font-normal text-text-2">districts cleared</span>
            </StatChip>
            <StatChip
              icon={<Star aria-hidden className="size-4 fill-amber text-amber" />}
              label="Stars"
            >
              {stats.stars} <span className="font-normal text-text-2">stars earned</span>
            </StatChip>
          </dl>
          <UserMenu />
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
      className="plate-ghost flex h-9 items-center gap-2 rounded-full border border-line-strong px-3.5 text-sm"
      title={label}
    >
      {icon}
      <dt className="sr-only">{label}</dt>
      <dd className="tabular font-semibold text-text-1">{children}</dd>
    </div>
  );
}
