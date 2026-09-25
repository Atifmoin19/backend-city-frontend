import type { Metadata } from "next";

import { GameScreen } from "@/features/game/GameScreen";

export const metadata: Metadata = { title: "Play" };

export default async function PlayPage({ params, searchParams }: PageProps<"/play/[slug]">) {
  const { slug } = await params;
  const { mode } = await searchParams;
  return <GameScreen slug={slug} mode={mode === "checkpoint" ? "checkpoint" : "practice"} />;
}
