"use client";

import { SlidersHorizontal } from "lucide-react";

import { Popover } from "./Popover";
import { SettingsRows } from "./SettingsRows";

/** Visitor settings: one labeled button instead of a row of mystery icons. */
export function SettingsMenu() {
  return (
    <Popover
      label="Settings"
      trigger={(props) => (
        <button
          type="button"
          {...props}
          className="plate-ghost inline-flex h-9 items-center gap-2 rounded-md border border-line-strong px-3 text-sm font-medium text-text-2 transition-colors hover:text-text-1"
        >
          <SlidersHorizontal aria-hidden className="size-4" />
          <span className="hidden sm:inline">Settings</span>
          <span className="sr-only sm:hidden">Settings</span>
        </button>
      )}
    >
      {() => <SettingsRows />}
    </Popover>
  );
}
