import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { RewardsScreen } from "@/features/rewards/RewardsScreen";

export const metadata: Metadata = { title: "Badges & XP" };

export default function BadgesPage() {
  return (
    <AppShell>
      <RewardsScreen />
    </AppShell>
  );
}
