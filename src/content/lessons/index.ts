import { academyPython } from "./academy-python";
import { gatehouseValidation } from "./gatehouse-validation";
import { signalTowerHttp } from "./signal-tower-http";
import type { Lesson } from "./types";

const LESSONS: Record<string, Lesson> = Object.fromEntries(
  [academyPython, signalTowerHttp, gatehouseValidation].map((l) => [l.slug, l]),
);

export const lessonBySlug = (slug: string): Lesson | undefined => LESSONS[slug];
export type { Lesson, LessonStep } from "./types";
