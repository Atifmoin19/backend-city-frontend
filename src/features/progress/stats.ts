import { DISTRICTS } from "@/content/districts";
import { TOPICS, type Topic } from "@/content/topics";
import type { TopicRecord } from "@/stores/learning";

export function topicComplete(topic: Topic, r: TopicRecord | undefined): boolean {
  return topic.game ? !!r?.checkpoint : !!r?.lessonDone;
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

export interface Mission {
  topic: Topic;
  step: "briefing" | "practice" | "checkpoint";
  label: string;
  href: string;
}

/** The next thing to do, in curriculum order. Null when every open topic is complete. */
export function nextMission(records: Record<string, TopicRecord>): Mission | null {
  for (const topic of TOPICS) {
    const r = records[topic.slug] ?? {};
    if (topicComplete(topic, r)) continue;
    if (!r.lessonDone) {
      return {
        topic,
        step: "briefing",
        label: `Read the briefing: ${topic.title}`,
        href: `/learn/${topic.lesson}`,
      };
    }
    if (topic.game && !r.practicePassed) {
      return {
        topic,
        step: "practice",
        label: `Practice: ${topic.title}`,
        href: `/play/${topic.game}?mode=practice`,
      };
    }
    return {
      topic,
      step: "checkpoint",
      label: `Checkpoint: ${topic.title}`,
      href: `/play/${topic.game}?mode=checkpoint`,
    };
  }
  return null;
}
