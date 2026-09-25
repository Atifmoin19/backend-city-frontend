import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Sora, Unbounded } from "next/font/google";

import "@/styles/globals.css";

import { THEME_BOOT_SCRIPT } from "@/lib/themeBoot";

import { Providers } from "./providers";

const unbounded = Unbounded({ subsets: ["latin"], variable: "--font-unbounded", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Backend City", template: "%s · Backend City" },
  description:
    "Learn backend development by playing. Write small snippets inside a real FastAPI server and watch live requests pass, bounce, or crash.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0e1630" },
    { media: "(prefers-color-scheme: light)", color: "#e8eef9" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${unbounded.variable} ${sora.variable} ${jetbrains.variable}`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        {/* Sets data-theme before first paint: no flash of the wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        {/*
          DIRECTION CONTRACT (impeccable, code-led, brief-pinned by ideology 9)
          THESIS: The city is a live status board: every light is a request that passed, bounced
          or crashed. Refuses the generic dark SaaS page with one neon accent.
          OWN-WORLD: night navy ground; four semantic neons (cyan flow, green 2xx, amber 4xx,
          red 5xx) + purple AI; wide sign-plate display type (Unbounded), Sora UI, JetBrains Mono
          code; 1px cables carrying pulses; glass only over moving scenes; calm solid editor.
          STORY: a frontend dev sees their future code handling traffic, starts a shift, walks the
          map, guards the gate.
          FIRST VIEWPORT: full-bleed skyline canvas; packets ride cables into towers; headline
          left-bottom; primary CTA "Start your first shift" under it; live legend of light meanings.
          FORM: pinned world (no roll); seed key: brief-pinned.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish
          review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
        */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
