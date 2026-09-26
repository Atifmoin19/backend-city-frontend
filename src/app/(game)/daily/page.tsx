import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { DailyScreen } from "@/features/quiz/DailyScreen";

export const metadata: Metadata = { title: "Daily challenge" };

export default function DailyPage() {
  return (
    <AppShell>
      <DailyScreen />
    </AppShell>
  );
}
