"use client";

import { useState } from "react";

import { StatusLight } from "@/components/ui/StatusLight";

const AGES = [5, 12, 13, 25, 120, 121];

/** Tiny playable taste of the Gatehouse: change the minimum age, see who gets in (pure JS). */
export function GateSnippet() {
  const [min, setMin] = useState(13);
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-line bg-editor">
      <div className="border-b border-line px-4 py-2 font-mono text-xs text-text-3">
        signup.py · try it
      </div>
      <div className="px-4 py-3 font-mono text-[0.85rem] leading-7 text-text-2">
        <div>class SignupRequest(BaseModel):</div>
        <label className="flex flex-wrap items-center gap-1 border-l-2 border-cyan bg-cyan/[0.07] pl-3 text-text-1">
          <span className="pl-4">age: int = Field(ge=</span>
          <input
            type="number"
            min={0}
            max={130}
            value={min}
            onChange={(e) => setMin(Math.max(0, Math.min(130, Number(e.target.value) || 0)))}
            className="w-14 rounded-sm border border-cyan/50 bg-bg-1 px-1.5 text-center text-cyan outline-none focus:shadow-glow-cyan"
            aria-label="Minimum age"
          />
          <span>, le=120)</span>
        </label>
      </div>
      <ul className="grid grid-cols-3 gap-px border-t border-line bg-line text-xs">
        {AGES.map((age) => {
          const ok = age >= min && age <= 120;
          return (
            <li key={age} className="flex items-center justify-between gap-2 bg-bg-1 px-3 py-2">
              <span className="font-mono text-text-2">age {age}</span>
              <StatusLight status={ok ? "pass" : "bounce"} className="text-xs">
                <span className="font-mono">{ok ? 201 : 422}</span>
              </StatusLight>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
