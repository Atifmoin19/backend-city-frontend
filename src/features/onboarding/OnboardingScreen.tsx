"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { SignHeading } from "@/components/ui/SignHeading";
import { sideByTrack } from "@/content/sides";
import { useSession } from "@/features/auth/useSession";
import { cn } from "@/lib/cn";
import { useLearning } from "@/features/progress/useLearning";

import { OnboardingVisual } from "./OnboardingVisual";
import { PlacementStep } from "./PlacementStep";
import { SideStep } from "./SideStep";
import { SLIDES } from "./slides";

const ease = [0.16, 1, 0.3, 1] as const;

/** First run: pick a side of the city, then orientation (story, how districts work, what the
 * lights mean, controls). */
export function OnboardingScreen() {
  const [i, setI] = useState(0);
  // side → placement (optional) → orientation slides
  const [stage, setStage] = useState<"side" | "placement" | "slides">("side");
  const sidePicked = stage === "slides";
  const { data: user } = useSession();
  const { markOnboarded } = useLearning();
  const router = useRouter();
  const slide = SLIDES[i]!;
  const last = i === SLIDES.length - 1;

  const finish = () => {
    markOnboarded.mutate();
    router.push("/map");
  };

  return (
    <div className="grid min-h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section
        className="flex flex-col justify-between px-6 py-10 sm:px-10 lg:px-16 lg:py-14"
        aria-live="polite"
      >
        {stage === "side" ? (
          <SideStep
            initial={sideByTrack(user?.learning_goal)?.track}
            onDone={() => setStage("placement")}
          />
        ) : stage === "placement" ? (
          <PlacementStep onDone={() => setStage("slides")} />
        ) : (
          <>
            <div>
              <p className="text-sm text-text-3">
                Orientation · {i + 1} of {SLIDES.length}
              </p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.key}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <SignHeading as="h1" className="mt-4 max-w-xl text-[clamp(1.9rem,3.6vw,3rem)]">
                    {slide.title(user?.display_name ?? "engineer")}
                  </SignHeading>
                  <div className="mt-6 flex max-w-xl flex-col gap-4 text-lg leading-relaxed text-text-2">
                    {slide.body}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <div className="flex gap-2" aria-hidden>
                {SLIDES.map((s, n) => (
                  <span
                    key={s.key}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-(--bc-dur-3)",
                      n === i ? "w-8 bg-cyan" : n < i ? "w-4 bg-green" : "w-4 bg-line-strong",
                    )}
                  />
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                {i === 0 ? (
                  <Button variant="quiet" onClick={finish}>
                    Skip orientation
                  </Button>
                ) : (
                  <Button
                    variant="quiet"
                    onClick={() => setI(i - 1)}
                    icon={<ArrowLeft aria-hidden className="size-4" />}
                  >
                    Back
                  </Button>
                )}
                <Button size="lg" onClick={last ? finish : () => setI(i + 1)}>
                  {last ? "Open the Backend District" : "Next"}
                  <ArrowRight aria-hidden className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </section>
      <aside
        className="relative hidden overflow-hidden border-l border-line bg-bg-1 lg:block"
        aria-hidden
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={sidePicked ? slide.visual : "sides"}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <OnboardingVisual visual={sidePicked ? slide.visual : "sides"} />
          </motion.div>
        </AnimatePresence>
      </aside>
    </div>
  );
}
