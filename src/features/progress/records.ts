import type { Topic } from "@/content/topics";
import type { Progress, TopicProgress } from "@/lib/api/types";

/** The learner's state for one topic, as the screens read it. */
export interface TopicRecord {
  lessonDone: boolean;
  /** Practice game slugs passed so far. */
  practiceDone: string[];
  /** Every required practice game passed: the checkpoint is open. */
  practicePassed: boolean;
  /** Set once the checkpoint is passed (best result). */
  checkpoint?: { score: number; stars: number };
  checkpointAttempts: number;
  /** Checkpoint fails since the last pass; after 2 we suggest a recap. */
  fails: number;
  /** ISO time the next checkpoint attempt opens, while a cooldown runs. */
  retryAt: string | null;
  complete: boolean;
}

export const EMPTY_RECORD: TopicRecord = {
  lessonDone: false,
  practiceDone: [],
  practicePassed: false,
  checkpointAttempts: 0,
  fails: 0,
  retryAt: null,
  complete: false,
};

export function recordFrom(topic: Topic, p: TopicProgress | undefined): TopicRecord {
  if (!p) return { ...EMPTY_RECORD, practicePassed: topic.practice.length === 0 };
  const practiceDone = p.practice_passed;
  return {
    lessonDone: p.lesson_done,
    practiceDone,
    practicePassed: topic.practice.every((g) => practiceDone.includes(g.slug)),
    checkpoint: p.checkpoint?.passed
      ? { score: p.checkpoint.best_score, stars: p.checkpoint.stars }
      : undefined,
    checkpointAttempts: p.checkpoint?.attempts ?? 0,
    fails: p.consecutive_fails,
    retryAt: p.retry_at,
    complete: p.complete,
  };
}

export function recordsFrom(topics: Topic[], progress: Progress | undefined) {
  const byTopic = new Map(progress?.topics.map((t) => [t.topic, t]));
  return Object.fromEntries(
    topics.map((t) => [t.slug, recordFrom(t, byTopic.get(t.slug))]),
  ) as Record<string, TopicRecord>;
}

/** Replace one topic inside the cached progress after a write returns it. */
export function withTopic(
  progress: Progress | undefined,
  next: TopicProgress,
): Progress | undefined {
  if (!progress) return progress;
  const known = progress.topics.some((t) => t.topic === next.topic);
  return {
    ...progress,
    topics: known
      ? progress.topics.map((t) => (t.topic === next.topic ? next : t))
      : [...progress.topics, next],
  };
}
