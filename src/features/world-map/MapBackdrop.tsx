import { MapAtmosphere } from "./MapAtmosphere";

/** Night sky, beams, fog and the living far skyline behind the districts. */
export function MapBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* sky */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,#22306a_0%,transparent_70%),radial-gradient(ellipse_50%_40%_at_15%_90%,rgb(77_255_154/0.07),transparent_70%),radial-gradient(ellipse_55%_45%_at_85%_95%,rgb(178_124_255/0.1),transparent_70%),linear-gradient(180deg,#0a1230,#0b1124_60%,#0d1632)]" />
      {/* stars */}
      <div className="absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(rgb(233_238_251/0.7)_1px,transparent_1.3px)] [mask-image:linear-gradient(180deg,black,transparent)] [background-size:140px_110px] opacity-30" />
      <div className="absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(rgb(233_238_251/0.5)_1px,transparent_1.2px)] [mask-image:linear-gradient(180deg,black,transparent)] [background-size:190px_150px] [background-position:70px_40px] opacity-25" />
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
