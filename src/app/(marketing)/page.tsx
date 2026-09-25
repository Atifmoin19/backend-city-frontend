import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { DistrictLine } from "@/features/landing/DistrictLine";
import { FinalCall } from "@/features/landing/FinalCall";
import { Hero } from "@/features/landing/Hero";
import { ShiftLoop } from "@/features/landing/ShiftLoop";

export default function LandingPage() {
  return (
    <>
      <SiteHeader className="absolute inset-x-0 top-0" />
      <main>
        <Hero />
        <ShiftLoop />
        <DistrictLine />
        <FinalCall />
      </main>
      <SiteFooter />
    </>
  );
}
