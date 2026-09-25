import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { WorldMap } from "@/features/world-map/WorldMap";

export const metadata: Metadata = { title: "City map" };

export default function MapPage() {
  return (
    <AppShell bleed>
      <h1 className="sr-only">Backend City map</h1>
      <WorldMap />
    </AppShell>
  );
}
