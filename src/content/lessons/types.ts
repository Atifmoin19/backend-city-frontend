export type DiagramKey = "gate-traffic" | "request-pipeline" | "status-families" | "http-exchange";

export interface CheckQuestion {
  prompt: string;
  options: { text: string; code?: boolean }[];
  correct: number;
  explain: string;
}

export interface LessonStep {
  title: string;
  byte: string; // Byte's one-line framing
  body: string[]; // paragraphs; `backticks` render as code
  code?: { file: string; source: string; highlight?: number[] };
  table?: { head: [string, string]; rows: [string, string][] };
  diagram?: DiagramKey;
  check?: CheckQuestion;
}

export interface Lesson {
  slug: string;
  title: string;
  steps: LessonStep[];
}
