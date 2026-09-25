export interface Chapter {
  id: string;
  level?: string;
  title: string;
  body: string;
  points?: string[];
  status?: "open" | "construction";
  align: "left" | "right";
}

/** Scroll story. Chapter i lines up with camera stop i in cityScene STOPS. */
export const CHAPTERS: Chapter[] = [
  { id: "hero", title: "", body: "", align: "left" },
  {
    id: "academy",
    level: "Level -1 · The Academy",
    title: "Start where you are.",
    body: "Coming from JavaScript? The Academy translates what you know (variables, objects, functions, classes and async) into Python. Six minutes, then the lights come on.",
    points: ["dicts are objects", "indentation is braces", "async def = async function"],
    status: "open",
    align: "left",
  },
  {
    id: "signal-tower",
    level: "Level 0 · The Signal Tower",
    title: "Learn how requests travel.",
    body: "Every tower speaks HTTP. Methods, paths, headers, bodies and status codes: the language your fetch() calls have been speaking all along.",
    points: [
      "GET · POST · PATCH · DELETE",
      "2xx served · 4xx bounced · 5xx crashed",
      "every request stands alone",
    ],
    status: "open",
    align: "right",
  },
  {
    id: "gatehouse",
    level: "Level 2 · The Gatehouse",
    title: "Then you write the rules.",
    body: "Edit two lines of a real FastAPI server. Glitch floods the gate with fake signups, and you watch every one of them bounce, or slip through.",
    status: "open",
    align: "left",
  },
  {
    id: "construction",
    level: "Seven more districts",
    title: "The rest of the city is being built.",
    body: "Routing, databases, auth, caching, queues, production and architecture. Each district opens with a briefing, a game and a checkpoint.",
    points: [
      "Router Station",
      "Data Vaults",
      "Citadel",
      "Speedway",
      "Factory",
      "Control Room",
      "Skyline",
    ],
    status: "construction",
    align: "right",
  },
];
