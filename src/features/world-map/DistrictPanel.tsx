"use client";

import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { SignHeading } from "@/components/ui/SignHeading";
import { StatusLight } from "@/components/ui/StatusLight";
import type { District } from "@/content/districts";

import { OPEN_DISTRICTS } from "@/content/topics";

import type { DistrictState } from "./progress";

export function DistrictPanel({ district, state }: { district: District; state: DistrictState }) {
  const open = OPEN_DISTRICTS.has(district.key);
  return (
    <Panel surface="glass" className="w-full p-5 sm:p-6" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-text-3">Level {district.level}</span>
        {state === "done" ? (
          <StatusLight status="pass">Cleared</StatusLight>
        ) : state === "active" ? (
          <StatusLight status="flow">Open: start here</StatusLight>
        ) : (
          <StatusLight status="locked">{open ? "Locked" : "In production"}</StatusLight>
        )}
      </div>
      <SignHeading as="h2" className="mt-3 text-xl sm:text-2xl">
        {district.name}
      </SignHeading>
      <p className="mt-1.5 text-text-2">{district.teaches}</p>
      <p className="mt-1 text-sm text-text-3">{district.metaphor}</p>
      <ul className="mt-5 flex flex-wrap gap-1.5">
        {district.topics.map((t) => (
          <li
            key={t}
            className="rounded-sm border border-line bg-bg-1/60 px-2 py-1 text-xs text-text-2"
          >
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        {open ? (
          <Link
            href={`/district/${district.key}`}
            className={buttonClasses({ className: "w-full" })}
          >
            {state === "done" ? "Revisit the district" : "Enter the district"}
          </Link>
        ) : (
          <p className="text-sm text-text-2">
            This district is still being built. Its lessons and games arrive in a later update.
          </p>
        )}
      </div>
    </Panel>
  );
}
