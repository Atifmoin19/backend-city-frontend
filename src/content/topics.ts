import type { DistrictKey } from "./districts";

/** A game served by the backend (the slug must match backend content/seed). */
export interface GameRef {
  slug: string;
  title: string;
  blurb: string;
}

/**
 * A topic = briefing (lesson) -> practice games -> checkpoint (ideology 4.2).
 * Lesson-only topics (no `checkpoint`) complete when the briefing is finished.
 */
export interface Topic {
  slug: string;
  district: DistrictKey;
  title: string;
  summary: string;
  lesson: string; // lesson slug in content/lessons
  practice: GameRef[]; // all must pass before the checkpoint opens
  checkpoint?: GameRef;
  minutes: number;
}

export const TOPICS: Topic[] = [
  {
    slug: "python-for-js",
    district: "academy",
    title: "Python for JavaScript developers",
    summary:
      "Variables, dicts, functions, classes with type hints, and async: just enough Python for FastAPI.",
    lesson: "academy-python",
    practice: [],
    minutes: 6,
  },
  {
    slug: "how-requests-travel",
    district: "signal-tower",
    title: "How a request travels",
    summary:
      "Client and server, the parts of an HTTP request, methods, status codes, and why every request stands alone.",
    lesson: "signal-tower-http",
    practice: [
      {
        slug: "signal-codes",
        title: "Signal Codes",
        blurb: "Pick the status code the tower sends back for each outcome.",
      },
      {
        slug: "method-lanes",
        title: "Method Lanes",
        blurb: "Put each action on the right HTTP method: GET, POST, PATCH or DELETE.",
      },
    ],
    checkpoint: {
      slug: "tower-relay",
      title: "Tower Relay",
      blurb: "Methods and status codes together, including who is logged in and who is allowed.",
    },
    minutes: 6,
  },
  {
    slug: "route-dispatch",
    district: "router-station",
    title: "Send every request to the right platform",
    summary:
      "Routes, path parameters with types, query parameters with defaults, and why route order matters.",
    lesson: "router-station-routes",
    practice: [
      {
        slug: "platform-paths",
        title: "Platform Paths",
        blurb: "Write a route with a typed path parameter so each train finds its platform.",
      },
      {
        slug: "query-filters",
        title: "Query Filters",
        blurb: "Read optional query parameters with defaults to filter the departures board.",
      },
    ],
    checkpoint: {
      slug: "route-dispatcher",
      title: "Route Dispatcher",
      blurb: "Several routes at once: fixed paths, typed IDs, filters, and the right order.",
    },
    minutes: 6,
  },
  {
    slug: "validate-signups",
    district: "gatehouse",
    title: "Validate what comes through the gate",
    summary:
      "Describe a request with a Pydantic model, add limits with Field(), and bounce bad data with 422.",
    lesson: "gatehouse-validation",
    practice: [
      {
        slug: "ticket-booth",
        title: "Ticket Booth",
        blurb: "Number limits: only sensible ticket orders get through.",
      },
      {
        slug: "badge-check",
        title: "Badge Check",
        blurb: "Text limits: badge codes and names of the right length.",
      },
    ],
    checkpoint: {
      slug: "signup-gate",
      title: "Guard the Signup Gate",
      blurb: "Numbers and text together, with hidden requests at every boundary.",
    },
    minutes: 5,
  },
];

export const topicsFor = (district: DistrictKey) => TOPICS.filter((t) => t.district === district);
export const topicByLesson = (lesson: string) => TOPICS.find((t) => t.lesson === lesson);
export const topicByGame = (game: string) =>
  TOPICS.find((t) => t.checkpoint?.slug === game || t.practice.some((p) => p.slug === game));

/** Districts with playable content today. Everything else is "under construction". */
export const OPEN_DISTRICTS = new Set<DistrictKey>(TOPICS.map((t) => t.district));
