"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Byte } from "@/components/characters/Byte";
import { Kbd } from "@/components/ui/Kbd";
import { DISTRICTS, type DistrictKey } from "@/content/districts";

import { DistrictNode } from "./DistrictNode";
import { DistrictPanel } from "./DistrictPanel";
import { MapRoads } from "./MapRoads";
import { useLearning } from "@/stores/learning";

import { activeDistrict, neighbor, progressFrom } from "./progress";

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

export function WorldMap() {
  const { records } = useLearning();
  const progress = progressFrom(records);
  const [selected, setSelected] = useState<DistrictKey>(activeDistrict(progress).key);
  const nodes = useRef(new Map<DistrictKey, HTMLButtonElement>());
  const district = DISTRICTS.find((d) => d.key === selected)!;

  const select = useCallback((key: DistrictKey, focus = true) => {
    setSelected(key);
    if (focus) nodes.current.get(key)?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_DIR[e.key];
      const target = e.target as HTMLElement | null;
      if (!dir || target?.closest("input, textarea, [contenteditable]")) return;
      e.preventDefault();
      select(neighbor(selected, dir));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, select]);

  return (
    <div className="relative grid min-h-[calc(100dvh-4rem)] lg:grid-cols-[1fr_22rem]">
      <section
        aria-label="Backend City map"
        className="relative min-h-[28rem] overflow-hidden border-line lg:border-r"
      >
        <div
          aria-hidden
          data-ambient
          className="city-grid absolute inset-0 animate-drift opacity-70"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent,var(--bc-bg-0)_85%)]"
        />
        <div className="absolute inset-x-6 top-12 bottom-14 sm:inset-x-12 sm:top-16 sm:bottom-16">
          <MapRoads progress={progress} />
          {DISTRICTS.map((d) => (
            <DistrictNode
              key={d.key}
              ref={(el) => {
                if (el) nodes.current.set(d.key, el);
              }}
              district={d}
              state={progress[d.key]}
              selected={d.key === selected}
              onSelect={() => select(d.key, false)}
            />
          ))}
          {/* Byte walks to the selected district */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-[245%]"
            animate={{ left: `${district.map.x}%`, top: `${district.map.y}%` }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
          >
            <Byte size={40} state={progress[selected] === "locked" ? "worried" : "happy"} />
          </motion.div>
        </div>
        <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-3 sm:left-6">
          <span className="rounded-sm border border-line-strong bg-bg-1 px-1.5 py-0.5 text-text-2">
            Early access: the Gatehouse is the first playable district
          </span>
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            Walk with <Kbd>←</Kbd>
            <Kbd>→</Kbd>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> or <Kbd>WASD</Kbd>
          </span>
        </div>
      </section>
      <div className="p-4 sm:p-6 lg:pt-10">
        <DistrictPanel district={district} state={progress[selected]} />
      </div>
    </div>
  );
}
