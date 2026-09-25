"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { City3D, type City3DHandle, type LoadStage } from "../city3d/City3D";
import { CityPreloader } from "../preloader/CityPreloader";
import type { Outcome } from "../city3d/cityScene";
import type { TrafficCounts } from "../LiveLegend";

import { ChapterPanel } from "./ChapterPanel";
import { CHAPTERS } from "./chapters";
import { HeroChapter } from "./HeroChapter";
import { playSound } from "@/lib/sound/engine";

/**
 * Pinned 3D city with chapters scrolling over it. Scroll position drives the camera flight
 * (chapter i = camera stop i) and switches each district's lights on.
 */
export function CityStory() {
  const wrap = useRef<HTMLElement>(null);
  const city = useRef<City3DHandle>(null);
  const lastChapter = useRef(-1);
  const [counts, setCounts] = useState<TrafficCounts>({ pass: 0, bounce: 0, crash: 0 });
  const onResolve = useCallback((o: Outcome) => setCounts((c) => ({ ...c, [o]: c[o] + 1 })), []);
  const [stages, setStages] = useState<ReadonlySet<LoadStage>>(() => new Set());
  const onStage = useCallback(
    (st: LoadStage) => setStages((prev) => (prev.has(st) ? prev : new Set(prev).add(st))),
    [],
  );

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = wrap.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const span = rect.height - innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
      city.current?.setProgress(p * (CHAPTERS.length - 1));
      // a soft chord as each district comes into view (only once the visitor enabled audio)
      const chapter = Math.round(p * (CHAPTERS.length - 1));
      if (chapter !== lastChapter.current) {
        if (lastChapter.current !== -1) playSound("chapter", chapter);
        lastChapter.current = chapter;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <CityPreloader stages={stages} />
      <section
        ref={wrap}
        id="city"
        aria-label="Tour of Backend City"
        className="relative"
        style={{ height: `${CHAPTERS.length * 100}dvh` }}
      >
        <div className="sticky top-0 h-dvh overflow-hidden">
          <City3D
            ref={city}
            onResolve={onResolve}
            onStage={onStage}
            className="absolute inset-0 size-full"
          />
          {/* legibility: soft vignette + bottom fade into the page */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgb(var(--bc-scrim-rgb)/0.75)_100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg-0/70"
          />
        </div>
        <div className="absolute inset-0">
          {CHAPTERS.map((c) => (
            <div key={c.id} id={c.id} className="h-dvh">
              {c.id === "hero" ? <HeroChapter counts={counts} /> : <ChapterPanel chapter={c} />}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
