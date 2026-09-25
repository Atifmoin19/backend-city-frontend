import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { RequireSession } from "@/features/session/RequireSession";
import { UserMenu } from "@/features/session/UserMenu";
import { WorldMap } from "@/features/world-map/WorldMap";

export const metadata: Metadata = { title: "City map" };

export default function MapPage() {
  return (
    <div className="min-h-dvh bg-bg-0">
      <SiteHeader className="border-b border-line">
        <UserMenu />
      </SiteHeader>
      <main>
        <h1 className="sr-only">Backend City map</h1>
        <RequireSession>
          <WorldMap />
        </RequireSession>
      </main>
    </div>
  );
}
