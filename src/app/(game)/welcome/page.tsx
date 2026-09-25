import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { OnboardingScreen } from "@/features/onboarding/OnboardingScreen";

export const metadata: Metadata = { title: "Welcome" };

export default function WelcomePage() {
  return (
    <AppShell bleed>
      <OnboardingScreen />
    </AppShell>
  );
}
