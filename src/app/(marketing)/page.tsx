import { SiteFooter } from "@/components/layout/SiteFooter";
import { Faq } from "@/features/landing/Faq";
import { FetchBridge } from "@/features/landing/FetchBridge";
import { FinalCall } from "@/features/landing/FinalCall";
import { LandingHeader } from "@/features/landing/LandingHeader";
import { CityStory } from "@/features/landing/story/CityStory";

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main className="bg-bg-0">
        <CityStory />
        <FetchBridge />
        <Faq />
        <FinalCall />
      </main>
      <SiteFooter />
    </>
  );
}
