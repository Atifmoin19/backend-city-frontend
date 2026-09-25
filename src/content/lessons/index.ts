import { gatehouseValidation } from "./gatehouse-validation";
import type { Lesson } from "./types";

const LESSONS: Record<string, Lesson> = {
  [gatehouseValidation.slug]: gatehouseValidation,
};

export const lessonBySlug = (slug: string): Lesson | undefined => LESSONS[slug];
export type { Lesson, LessonStep } from "./types";
