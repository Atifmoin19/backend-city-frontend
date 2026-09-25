import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { lessonBySlug } from "@/content/lessons";
import { topicByLesson } from "@/content/topics";
import { LessonScreen } from "@/features/lesson/LessonScreen";

export const metadata: Metadata = { title: "Briefing" };

export default async function LearnPage({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const lesson = lessonBySlug(slug);
  const topic = topicByLesson(slug);
  if (!lesson || !topic) notFound();
  return <LessonScreen lesson={lesson} topic={topic} />;
}
