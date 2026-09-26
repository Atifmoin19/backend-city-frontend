import { academyPython } from "./academy-python";
import { dataVaultsSql } from "./data-vaults-sql";
import { dataVaultsWrites } from "./data-vaults-writes";
import { gatehouseValidation } from "./gatehouse-validation";
import { routerStationRoutes } from "./router-station-routes";
import { signalTowerHttp } from "./signal-tower-http";
import type { Lesson } from "./types";

const LESSONS: Record<string, Lesson> = Object.fromEntries(
  [
    academyPython,
    signalTowerHttp,
    routerStationRoutes,
    gatehouseValidation,
    dataVaultsSql,
    dataVaultsWrites,
  ].map((l) => [l.slug, l]),
);

export const lessonBySlug = (slug: string): Lesson | undefined => LESSONS[slug];
export type { Lesson, LessonStep } from "./types";
