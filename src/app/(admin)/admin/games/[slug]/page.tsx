import { GameEditor } from "@/features/admin/GameEditor";

export default async function AdminGamePage({ params }: PageProps<"/admin/games/[slug]">) {
  const { slug } = await params;
  return <GameEditor slug={slug} />;
}
