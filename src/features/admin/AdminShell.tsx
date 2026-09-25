"use client";

import { FileCode2, Map, ShieldAlert, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Wordmark } from "@/components/layout/Wordmark";
import { useSession } from "@/features/auth/useSession";
import { RequireSession } from "@/features/session/RequireSession";
import { UserMenu } from "@/features/session/UserMenu";
import { isAdmin } from "@/lib/api/admin";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Content", icon: FileCode2 },
  { href: "/admin/users", label: "Learners", icon: Users },
];

/** Shell for /admin: its own nav, and a clear stop for accounts without an admin role. */
export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="flex min-h-dvh flex-col bg-bg-0">
      <header className="sticky top-0 z-30 border-b border-line bg-bg-1/90 backdrop-blur-md">
        <div className="flex h-16 items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Wordmark />
          <span className="rounded-sm border border-amber/50 px-2 py-0.5 font-mono text-xs text-amber">
            admin
          </span>
          <nav aria-label="Admin" className="flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/admin"
                  ? path === "/admin" || path.startsWith("/admin/games")
                  : path.startsWith(href);
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
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/map"
              className="hidden items-center gap-1.5 text-sm text-text-2 hover:text-text-1 md:inline-flex"
            >
              <Map aria-hidden className="size-4" /> Back to the city
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="flex-1 pb-16">
        <RequireSession>
          <AdminOnly>{children}</AdminOnly>
        </RequireSession>
      </main>
    </div>
  );
}

function AdminOnly({ children }: { children: ReactNode }) {
  const { data: user } = useSession();
  if (isAdmin(user?.role)) return <>{children}</>;
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-24 text-center">
      <ShieldAlert aria-hidden className="size-8 text-amber" />
      <h1 className="font-display text-xl font-semibold">Admins only</h1>
      <p className="text-text-2">
        This area is for content editors and super admins. Ask a super admin to change your role.
      </p>
      <Link href="/map" className="text-cyan underline">
        Back to the city map
      </Link>
    </div>
  );
}
