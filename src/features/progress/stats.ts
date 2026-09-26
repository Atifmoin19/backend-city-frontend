import { DISTRICTS } from "@/content/districts";
import { TOPICS, type GameRef, type Topic } from "@/content/topics";

import type { TopicRecord } from "./records";

export function topicComplete(_topic: Topic, r: TopicRecord | undefined): boolean {
  return !!r?.complete;
}

export interface CityStats {
  districtsCleared: number;
  districtsTotal: number;
  topicsDone: number;
  topicsTotal: number;
  stars: number;
}

/** Real numbers only: derived from the learner's own records. */
export function cityStats(records: Record<string, TopicRecord>): CityStats {
  const cleared = DISTRICTS.filter((d) => {
    const topics = TOPICS.filter((t) => t.district === d.key);
    return topics.length > 0 && topics.every((t) => topicComplete(t, records[t.slug]));
  }).length;
  return {
    districtsCleared: cleared,
    districtsTotal: DISTRICTS.length,
    topicsDone: TOPICS.filter((t) => topicComplete(t, records[t.slug])).length,
    topicsTotal: TOPICS.length,
    stars: TOPICS.reduce((n, t) => n + (records[t.slug]?.checkpoint?.stars ?? 0), 0),
  };
}

/** First practice game not passed yet (the one to play next), if any. */
export function nextPractice(topic: Topic, r: TopicRecord | undefined): GameRef | undefined {
  return topic.practice.find((g) => !r?.practiceDone.includes(g.slug));
}

export const practiceHref = (slug: string) => `/play/${slug}?mode=practice`;
export const checkpointHref = (slug: string) => `/play/${slug}?mode=checkpoint`;

export interface Mission {
  topic: Topic;
  step: "briefing" | "practice" | "checkpoint";
  label: string;
  href: string;
}

/**
 * The next thing to do, in curriculum order. Null when every open topic is complete.
 * `start` (the placement suggestion) begins the search at that district; earlier topics
 * come back once everything after it is done.
 */
export function nextMission(
  records: Record<string, TopicRecord>,
  start?: string | null,
  topics: Topic[] = TOPICS,
): Mission | null {
  const from = Math.max(
    0,
    topics.findIndex((t) => t.district === start),
  );
  for (const topic of [...topics.slice(from), ...topics.slice(0, from)]) {
    const r = records[topic.slug];
    if (topicComplete(topic, r)) continue;
    if (!r?.lessonDone || !topic.checkpoint) {
      return {
        topic,
        step: "briefing",
        label: `Read the briefing: ${topic.title}`,
        href: `/learn/${topic.lesson}`,
      };
    }
    const practice = nextPractice(topic, r);
    if (practice) {
      return {
        topic,
        step: "practice",
        label: `Practice: ${practice.title}`,
        href: practiceHref(practice.slug),
      };
    }
    return {
      topic,
      step: "checkpoint",
      label: `Checkpoint: ${topic.checkpoint.title}`,
      href: checkpointHref(topic.checkpoint.slug),
    };
  }
  return null;
}
