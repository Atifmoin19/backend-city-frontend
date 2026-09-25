import { Kbd } from "@/components/ui/Kbd";

/** Controls + legend, docked at the bottom of the map's side HUD. */
export function MapGuide() {
  return (
    <div className="mt-auto grid gap-3 rounded-lg border border-line bg-bg-1/70 p-4 text-xs text-text-2">
      <p className="flex flex-wrap items-center gap-1.5">
        <Kbd>←</Kbd>
        <Kbd>→</Kbd> walk the road · <Kbd>↑</Kbd>
        <Kbd>↓</Kbd> jump · or click a district
      </p>
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-green" /> Cleared
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-cyan" /> Open
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full border border-text-3" /> Under
          construction
        </li>
      </ul>
    </div>
  );
}
