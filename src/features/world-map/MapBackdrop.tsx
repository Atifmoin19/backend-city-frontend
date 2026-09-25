import { MapAtmosphere } from "./MapAtmosphere";

/** Night sky, beams, fog and the living far skyline behind the districts. */
export function MapBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* sky */}
      <div className="absolute inset-0 [background:var(--bc-map-sky)]" />
      {/* stars */}
      <div className="absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(rgb(var(--bc-star-rgb)/0.7)_1px,transparent_1.3px)] [mask-image:linear-gradient(180deg,black,transparent)] [background-size:140px_110px] opacity-30" />
      <div className="absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(rgb(var(--bc-star-rgb)/0.5)_1px,transparent_1.2px)] [mask-image:linear-gradient(180deg,black,transparent)] [background-size:190px_150px] [background-position:70px_40px] opacity-25" />
      {/* sweeping search beams */}
      <div
        data-ambient
        className="map-beam absolute bottom-[-10%] left-[18%] h-[120%] w-[26rem] origin-bottom"
      />
      <div
        data-ambient
        className="map-beam map-beam--late absolute right-[22%] bottom-[-10%] h-[120%] w-[22rem] origin-bottom"
      />
      {/* far skyline + particles */}
      <MapAtmosphere />
      {/* ground grid with perspective fade */}
      <div
        data-ambient
        className="city-grid absolute inset-0 [mask-image:linear-gradient(180deg,transparent_10%,black_45%,black_75%,transparent)] opacity-35"
      />
      {/* drifting fog */}
      <div data-ambient className="map-fog absolute inset-x-[-20%] bottom-[8%] h-40" />
    </div>
  );
}
