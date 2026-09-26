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
    // practice only: the Academy stays a lesson-completed topic (no checkpoint), so learners
    // who already finished the briefing keep it cleared
    practice: [
      {
        slug: "front-desk",
        title: "Front Desk",
        blurb: "Read a JSON body as a dict and answer with f-strings, len() and `in`.",
      },
      {
        slug: "score-board",
        title: "Score Board",
        blurb: "Filter and rank a list with a comprehension and sorted(key=...).",
      },
    ],
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
  {
    slug: "query-the-vault",
    district: "data-vaults",
    title: "Ask the vault the right question",
    summary:
      "Tables and rows, SELECT / WHERE / ORDER BY, safe ? parameters instead of pasted input, and JOIN.",
    lesson: "data-vaults-sql",
    practice: [
      {
        slug: "shelf-search",
        title: "Shelf Search",
        blurb: "Filter and sort the vault's items with WHERE, ORDER BY and a ? parameter.",
      },
      {
        slug: "item-floors",
        title: "Item Floors",
        blurb: "JOIN items with vaults to find each item's floor, and 404 for the missing ones.",
      },
    ],
    checkpoint: {
      slug: "vault-ledger",
      title: "Vault Ledger",
      blurb: "Filter, sort, count and total a vault's items, and shut the SQL injection hole.",
    },
    minutes: 7,
  },
  {
    slug: "write-the-vault",
    district: "data-vaults",
    title: "Change the vault safely",
    summary:
      "INSERT with parameters, GROUP BY and LEFT JOIN in one query, table rules, and transactions that are all or nothing.",
    lesson: "data-vaults-writes",
    practice: [
      {
        slug: "stock-room",
        title: "Stock Room",
        blurb: "INSERT new items with ? parameters, answer the new id, and refuse unknown vaults.",
      },
      {
        slug: "vault-census",
        title: "Vault Census",
        blurb: "Count and total every vault in one GROUP BY query, empty vaults included.",
      },
    ],
    checkpoint: {
      slug: "vault-transfer",
      title: "Vault Transfer",
      blurb:
        "Move gold between vaults in a transaction: all or nothing, 404 and 409 when it can't.",
    },
    minutes: 8,
  },
];

export const topicsFor = (district: DistrictKey, topics: Topic[] = TOPICS) =>
  topics.filter((t) => t.district === district);
export const topicByLesson = (lesson: string) => TOPICS.find((t) => t.lesson === lesson);
export const topicByGame = (game: string, topics: Topic[] = TOPICS) =>
  topics.find((t) => t.checkpoint?.slug === game || t.practice.some((p) => p.slug === game));

interface LiveGame {
  slug: string;
  title: string;
  objective: string;
  is_checkpoint: boolean;
}

/**
 * Topics with their game lists taken from the server (what admins published), keeping the
 * hand-written blurb where there is one. A hidden game drops out; a new one appears with its
 * objective as the blurb. Without server data the static lists stand.
 */
export function withLiveGames(
  topics: Topic[],
  live: { topic: string; games?: LiveGame[] }[] | undefined,
): Topic[] {
  if (!live) return topics;
  const byTopic = new Map(live.map((t) => [t.topic, t.games]));
  return topics.map((topic) => {
    const games = byTopic.get(topic.slug);
    if (!games) return topic;
    const known = [...topic.practice, ...(topic.checkpoint ? [topic.checkpoint] : [])];
    const ref = (g: LiveGame): GameRef => ({
      slug: g.slug,
      title: g.title,
      blurb: known.find((k) => k.slug === g.slug)?.blurb ?? g.objective,
    });
    const checkpoint = games.find((g) => g.is_checkpoint);
    return {
      ...topic,
      practice: games.filter((g) => !g.is_checkpoint).map(ref),
      checkpoint: checkpoint ? ref(checkpoint) : undefined,
    };
  });
}

/** Districts with playable content today. Everything else is "under construction". */
export const OPEN_DISTRICTS = new Set<DistrictKey>(TOPICS.map((t) => t.district));
