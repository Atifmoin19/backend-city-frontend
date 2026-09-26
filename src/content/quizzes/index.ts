import type { DistrictKey } from "../districts";

import { pickGate, pickRoutes } from "./pick-the-line";
import { placement } from "./placement";
import { statusSpeedRound } from "./status-speed-round";
import type { Quiz } from "./types";

/** Extra-practice quizzes, shown on their district's page. Placement is reached from onboarding. */
export const QUIZZES: Quiz[] = [statusSpeedRound, pickRoutes, pickGate];

export const quizBySlug = (slug: string): Quiz | undefined =>
  slug === placement.slug ? placement : QUIZZES.find((q) => q.slug === slug);

export const quizzesFor = (district: DistrictKey) => QUIZZES.filter((q) => q.district === district);

export { placement, placementStart } from "./placement";
export type { Quiz, QuizItem } from "./types";
