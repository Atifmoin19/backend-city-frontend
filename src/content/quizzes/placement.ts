import type { DistrictKey } from "../districts";

import type { Quiz } from "./types";

const c = (text: string) => ({ text, code: true });

/** Two minutes, no feedback until the end: suggests where to start (ideology 3). */
export const placement: Quiz = {
  slug: "placement",
  title: "Placement check",
  kind: "placement",
  district: "academy",
  blurb:
    "Eight questions, about two minutes. We'll suggest where to start; every district stays open.",
  draw: 8,
  items: [
    {
      skill: "python",
      prompt: 'With `user = {"name": "Neo"}`, how do you read the name?',
      options: [c('user["name"]'), c("user.name"), c("user->name"), c("user(name)")],
      correct: 0,
      explain: "Dicts use square brackets; dot access is for objects.",
    },
    {
      skill: "python",
      prompt: "Which line defines a function in Python?",
      options: [
        c("def greet(name):"),
        c("function greet(name) {"),
        c("greet = (name) =>"),
        c("fn greet(name):"),
      ],
      correct: 0,
      explain: "`def`, a colon, and an indented body.",
    },
    {
      skill: "python",
      prompt: "What does `[n * 2 for n in [1, 2, 3] if n > 1]` give?",
      options: [c("[4, 6]"), c("[2, 4, 6]"), c("[1, 2, 3]"), c("[2, 3]")],
      correct: 0,
      explain: "Filter first (2, 3), then double: [4, 6].",
    },
    {
      skill: "python",
      prompt: "Python's `null` is…",
      options: [c("None"), c("null"), c("undefined"), c("nil")],
      correct: 0,
      explain: "`None`, capitalised.",
    },
    {
      skill: "http",
      prompt: "Which method should create a new resource?",
      options: [c("POST"), c("GET"), c("DELETE"), c("HEAD")],
      correct: 0,
      explain: "POST creates; GET only reads.",
    },
    {
      skill: "http",
      prompt: "The server's own code crashed. Which status family?",
      options: [c("5xx"), c("4xx"), c("2xx"), c("3xx")],
      correct: 0,
      explain: "5xx is the server's fault; 4xx is the client's.",
    },
    {
      skill: "http",
      prompt: "In `/trains/7?line=red`, what is `line=red`?",
      options: [
        { text: "A query parameter" },
        { text: "A path parameter" },
        { text: "A header" },
        { text: "The request body" },
      ],
      correct: 0,
      explain: "Everything after `?` is the query string.",
    },
    {
      skill: "http",
      prompt: "A valid JSON body has `age: -3` where age must be positive. FastAPI answers…",
      options: [c("422"), c("400"), c("404"), c("500")],
      correct: 0,
      explain: "422: readable, but it breaks the model's rules.",
    },
  ],
};

/** Weak Python: the Academy. Python fine but HTTP shaky: the Signal Tower. Both: routing. */
export function placementStart(correctBySkill: Record<"python" | "http", number>): DistrictKey {
  if (correctBySkill.python < 3) return "academy";
  if (correctBySkill.http < 3) return "signal-tower";
  return "router-station";
}
