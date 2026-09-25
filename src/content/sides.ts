/** The three sides of Full Stack City (backend track slugs). Display copy lives here. */

export type SideKey = "frontend" | "python-backend" | "full-stack";

export interface Side {
  track: SideKey;
  name: string;
  tagline: string;
  body: string;
  covers: string[];
  /** Used until GET /content/tracks answers (and if it can't). */
  fallbackStatus: "open" | "coming_soon";
}

export const SIDES: Side[] = [
  {
    track: "frontend",
    name: "Frontend District",
    tagline: "The surface everyone sees",
    body: "Glass, light and signs: build the pages, components and interactions people touch.",
    covers: ["HTML & CSS", "JavaScript", "components", "state"],
    fallbackStatus: "coming_soon",
  },
  {
    track: "python-backend",
    name: "Backend District",
    tagline: "The steel inside the buildings",
    body: "Requests, routing, validation, data and auth. Write real FastAPI code and watch live traffic hit it.",
    covers: ["HTTP", "routing", "validation", "databases"],
    fallbackStatus: "open",
  },
  {
    track: "full-stack",
    name: "Full Stack Path",
    tagline: "Both sides, wired together",
    body: "Take one feature from the button a user clicks all the way down to the database and back.",
    covers: ["fetch ↔ API", "auth end to end", "deploys"],
    fallbackStatus: "coming_soon",
  },
];

export const sideByTrack = (track: string | null | undefined) =>
  SIDES.find((s) => s.track === track);
