import type { DistrictKey } from "./districts";

/** A topic = briefing (lesson) -> practice -> checkpoint (ideology 4.2). */
export interface Topic {
  slug: string;
  district: DistrictKey;
  title: string;
  summary: string;
  lesson: string; // lesson slug in content/lessons
  game: string; // game slug served by the backend
  minutes: number;
}

export const TOPICS: Topic[] = [
  {
    slug: "validate-signups",
    district: "gatehouse",
    title: "Validate what comes through the gate",
    summary:
      "Describe a request with a Pydantic model, add limits with Field(), and bounce bad data with 422.",
    lesson: "gatehouse-validation",
    game: "signup-gate",
    minutes: 5,
  },
];

export const topicsFor = (district: DistrictKey) => TOPICS.filter((t) => t.district === district);
export const topicByLesson = (lesson: string) => TOPICS.find((t) => t.lesson === lesson);
export const topicByGame = (game: string) => TOPICS.find((t) => t.game === game);

/** Districts with playable content today. Everything else is "in production". */
export const OPEN_DISTRICTS = new Set<DistrictKey>(TOPICS.map((t) => t.district));
