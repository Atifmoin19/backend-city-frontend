/** Curriculum districts (ideology 5 + 8.1). Static until the content API serves levels. */

export type DistrictKey =
  | "academy"
  | "signal-tower"
  | "router-station"
  | "gatehouse"
  | "data-vaults"
  | "citadel"
  | "speedway"
  | "factory"
  | "control-room"
  | "skyline";

export interface District {
  key: DistrictKey;
  level: number;
  name: string;
  teaches: string;
  metaphor: string;
  topics: string[];
  optional?: boolean;
  /** Position on the world map, in % of the map box. */
  map: { x: number; y: number };
}

export const DISTRICTS: District[] = [
  {
    key: "academy",
    level: -1,
    name: "The Academy",
    teaches: "Python survival kit",
    metaphor: "Training ground",
    topics: [
      "Variables & types",
      "Lists & dicts",
      "Functions",
      "Exceptions",
      "Classes",
      "async/await",
    ],
    optional: true,
    map: { x: 9, y: 74 },
  },
  {
    key: "signal-tower",
    level: 0,
    name: "The Signal Tower",
    teaches: "How the web works",
    metaphor: "Messages travel between towers",
    topics: ["Client vs server", "HTTP anatomy", "Methods", "Status codes", "JSON", "REST"],
    map: { x: 20, y: 52 },
  },
  {
    key: "router-station",
    level: 1,
    name: "The Router Station",
    teaches: "Routing & request handling",
    metaphor: "Trains sent to the right platform",
    topics: ["Routes", "Path params", "Query params", "Request body", "APIRouter", "Versioning"],
    map: { x: 32, y: 30 },
  },
  {
    key: "gatehouse",
    level: 2,
    name: "The Gatehouse",
    teaches: "Validation & errors",
    metaphor: "Guards checking everyone entering",
    topics: [
      "Never trust input",
      "Pydantic models",
      "Constraints",
      "Custom validators",
      "Error codes",
    ],
    map: { x: 45, y: 55 },
  },
  {
    key: "data-vaults",
    level: 3,
    name: "The Data Vaults",
    teaches: "Databases, modeling & ORM",
    metaphor: "Underground archives of glowing tables",
    topics: ["SQL", "JOINs", "Modeling", "SQLAlchemy", "N+1", "Transactions", "Indexes"],
    map: { x: 55, y: 80 },
  },
  {
    key: "citadel",
    level: 4,
    name: "The Citadel",
    teaches: "Authentication & authorization",
    metaphor: "Fortress of keys and badges",
    topics: ["Hashing", "JWT", "Refresh tokens", "RBAC", "Ownership checks"],
    map: { x: 62, y: 28 },
  },
  {
    key: "speedway",
    level: 5,
    name: "The Speedway",
    teaches: "Performance & caching",
    metaphor: "Shortcuts and racing lines",
    topics: ["Pagination", "Caching", "TTL", "Redis", "Rate limiting"],
    map: { x: 73, y: 57 },
  },
  {
    key: "factory",
    level: 6,
    name: "The Factory",
    teaches: "Async & background work",
    metaphor: "Conveyor belts and workers",
    topics: ["Background tasks", "Queues", "Retries", "Idempotency", "Webhooks", "Cron"],
    map: { x: 82, y: 82 },
  },
  {
    key: "control-room",
    level: 7,
    name: "The Control Room",
    teaches: "Production skills",
    metaphor: "Screens, logs and alarms",
    topics: ["Logs", "Testing", "Config & secrets", "OWASP", "Docker", "Deploys"],
    map: { x: 86, y: 38 },
  },
  {
    key: "skyline",
    level: 8,
    name: "The Skyline",
    teaches: "Architecture & scaling",
    metaphor: "The whole city from above",
    topics: ["Scaling", "Load balancers", "Replicas", "CDNs", "WebSockets", "System design"],
    map: { x: 94, y: 14 },
  },
];

export const districtByKey = (key: string): District | undefined =>
  DISTRICTS.find((d) => d.key === key);
