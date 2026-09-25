/** Night sky, faint street grid and a distant skyline silhouette behind the districts. */
export function MapBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,#1b2a56_0%,transparent_70%),radial-gradient(ellipse_60%_50%_at_85%_100%,rgb(62_230_255/0.08),transparent_70%),linear-gradient(180deg,var(--bc-bg-0),#0d1530)]" />
      <div className="absolute inset-0 bg-[radial-gradient(rgb(233_238_251/0.5)_1px,transparent_1.2px)] [background-size:120px_90px] opacity-25" />
      <div
        data-ambient
        className="city-grid absolute inset-0 [mask-image:linear-gradient(180deg,transparent,black_30%,black_70%,transparent)] opacity-40"
      />
      <svg
        className="absolute inset-x-0 bottom-0 h-40 w-full"
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
      >
        <path
          d="M0 160 V110 h40 v-30 h30 v40 h25 v-60 h35 v50 h30 v-20 h40 v35 h20 v-70 h45 v60 h30 v-25 h35 v40 h25 v-55 h40 v45 h30 v-35 h50 v50 h25 v-80 h40 v70 h30 v-30 h35 v45 h30 v-60 h45 v55 h25 v-25 h40 v35 h30 v-65 h35 v60 h30 v-20 h45 v30 h25 v-50 h40 v45 h30 v-30 h40 v40 V160 Z"
          className="fill-bg-1"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}
