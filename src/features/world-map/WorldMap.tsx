"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Byte } from "@/components/characters/Byte";
import { DISTRICTS, type DistrictKey } from "@/content/districts";
import { useLearning } from "@/features/progress/useLearning";

import { DistrictNode } from "./DistrictNode";
import { DistrictPanel } from "./DistrictPanel";
import { MapBackdrop } from "./MapBackdrop";
import { MapRoads } from "./MapRoads";
import { MapGuide } from "./MapGuide";
import { MissionCard } from "./MissionCard";
import { activeDistrict, neighbor, progressFrom, restorationFrom } from "./progress";
import { playSound } from "@/lib/sound/engine";

const KEY_DIR: Record<string, "up" | "down" | "left" | "right"> = {
  ArrowUp: "up",
  w: "up",
  W: "up",
  ArrowDown: "down",
  s: "down",
  S: "down",
  ArrowLeft: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  d: "right",
  D: "right",
};

/** Full-screen city map with HUD overlays. Scrolls horizontally on narrow screens. */
export function WorldMap() {
  const { records } = useLearning();
  const progress = progressFrom(records);
  const restored = restorationFrom(records);
  const [selected, setSelected] = useState<DistrictKey>(activeDistrict(progress).key);
  const nodes = useRef(new Map<DistrictKey, HTMLButtonElement>());
  const district = DISTRICTS.find((d) => d.key === selected)!;

  const select = useCallback((key: DistrictKey, focus = true) => {
    setSelected(key);
    if (focus) nodes.current.get(key)?.focus({ preventScroll: false });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_DIR[e.key];
      const target = e.target as HTMLElement | null;
      if (!dir || target?.closest("input, textarea, [contenteditable]")) return;
      e.preventDefault();
      const to = neighbor(selected, dir);
      if (to !== selected) playSound("step");
      select(to);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, select]);

  return (
    <div className="relative grid h-[calc(100dvh-4rem)] min-h-[40rem] lg:grid-cols-[minmax(0,1fr)_25rem]">
      <MapBackdrop />
      {/* World layer (horizontal scroll on small screens) */}
      <section
        aria-label="Backend District map"
        className="relative min-h-[34rem] overflow-x-auto overflow-y-hidden"
      >
        <div className="relative h-full min-w-[60rem]">
          <div className="absolute inset-x-[5%] top-[16%] bottom-[14%]">
            <MapRoads progress={progress} />
            {DISTRICTS.map((d) => (
              <DistrictNode
                key={d.key}
                ref={(el) => {
                  if (el) nodes.current.set(d.key, el);
                }}
                district={d}
                state={progress[d.key]}
                restored={restored[d.key]}
                selected={d.key === selected}
                onSelect={() => select(d.key, false)}
              />
            ))}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute z-20 flex -translate-x-1/2 -translate-y-[calc(100%+4.75rem)] flex-col items-center"
              animate={{ left: `${district.map.x}%`, top: `${district.map.y}%` }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
            >
              <span className="mb-1 rounded-sm bg-purple px-1.5 py-0.5 text-[10px] font-semibold text-on-neon">
                YOU
              </span>
              <Byte size={44} state={progress[selected] === "locked" ? "worried" : "happy"} />
              <span className="-mt-1 h-1.5 w-7 rounded-full bg-black/50 blur-[2px]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Side HUD */}
      <aside className="relative z-10 flex flex-col gap-4 overflow-y-auto border-line bg-bg-0/40 p-4 backdrop-blur-sm sm:p-5 lg:border-l">
        <MissionCard records={records} />
        <DistrictPanel district={district} state={progress[selected]} records={records} />
        <MapGuide />
      </aside>
    </div>
  );
}
