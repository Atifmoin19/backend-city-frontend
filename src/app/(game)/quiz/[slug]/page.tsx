import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { quizBySlug } from "@/content/quizzes";
import { QuizScreen } from "@/features/quiz/QuizScreen";

export const metadata: Metadata = { title: "Quiz" };

export default async function QuizPage({ params }: PageProps<"/quiz/[slug]">) {
  const { slug } = await params;
  const quiz = quizBySlug(slug);
  if (!quiz || quiz.kind === "placement") notFound();
  return (
    <AppShell>
      <QuizScreen slug={quiz.slug} />
    </AppShell>
  );
}
