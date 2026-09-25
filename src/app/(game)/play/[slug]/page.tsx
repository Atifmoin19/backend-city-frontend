import type { Metadata } from "next";

import { GameScreen } from "@/features/game/GameScreen";

export const metadata: Metadata = { title: "Play" };

export default async function PlayPage({ params }: PageProps<"/play/[slug]">) {
  const { slug } = await params;
  return <GameScreen slug={slug} />;
}
