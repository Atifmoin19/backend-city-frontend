export interface Chapter {
  id: string;
  level?: string;
  title: string;
  body: string;
  points?: string[];
  status?: "open" | "construction" | "soon";
  align: "left" | "right";
}

/** Scroll story. Chapter i lines up with camera stop i in cityScene STOPS. */
export const CHAPTERS: Chapter[] = [
  { id: "hero", title: "", body: "", align: "left" },
  // ---- the surface: Frontend District (coming soon) ----
  {
    id: "frontend",
    level: "The surface · Frontend District",
    title: "Everything users see.",
    body: "This whole skyline is the frontend: every window is an interface someone taps, reads or scrolls. The Frontend District teaches you to build it. It opens soon; take the tour.",
    status: "soon",
    align: "right",
  },
  {
    id: "html",
    level: "Frontend District · HTML",
    title: "Every building starts as structure.",
    body: "Blocks, floors and doors before any paint. HTML is that structure: headings, sections, forms and buttons, nested like buildings on a street.",
    points: ["<header>", "<main>", "<form>", "<button>"],
    status: "soon",
    align: "left",
  },
  {
    id: "css",
    level: "Frontend District · CSS",
    title: "Then paint, glass and light.",
    body: "Watch the windows come on. CSS decides color, spacing, layout and motion: why one street feels calm and the next one glows.",
    points: ["flexbox & grid", "color & type", "responsive"],
    status: "soon",
    align: "right",
  },
  {
    id: "javascript",
    level: "Frontend District · JavaScript",
    title: "JavaScript makes it move.",
    body: "Traffic, signals and lights that react when you click. JavaScript listens to people and changes the page, and it is what calls fetch() to talk to the buildings' insides.",
    points: ["events", "the DOM", "fetch()"],
    status: "soon",
    align: "left",
  },
  {
    id: "components",
    level: "Frontend District · components & state",
    title: "Build once, reuse everywhere.",
    body: "From up here the city repeats itself: the same towers, the same windows, lit or dark. Components are those reusable pieces; state is which lights are on right now.",
    points: ["components", "props", "state"],
    status: "soon",
    align: "right",
  },
  // ---- the dive: Backend District (open) ----
  {
    id: "backend",
    level: "Under the glass · Backend District",
    title: "Now look inside a building.",
    body: "Every page is held up by things nobody sees. Peel the glass away and there it is: the structure that serves every window. This is the backend, and it is open today.",
    points: ["servers", "requests", "rules", "data"],
    status: "open",
    align: "left",
  },
  {
    id: "frame",
    level: "The steel frame · FastAPI",
    title: "A frame that carries the load.",
    body: "Columns and beams take every request's weight so your code doesn't have to. That frame is the framework: FastAPI, the one you write inside in every game.",
    points: ["routes", "requests in", "responses out"],
    status: "open",
    align: "right",
  },
  {
    id: "academy",
    level: "The brick core · The Academy",
    title: "Brick by brick: Python.",
    body: "Up close, the core is made of small, plain bricks. Coming from JavaScript? The Academy translates what you know (variables, objects, functions, classes, async) into Python.",
    points: ["dicts are objects", "indentation is braces", "async def = async function"],
    status: "open",
    align: "left",
  },
  {
    id: "gatehouse",
    level: "Ground floor · The Gatehouse",
    title: "Nobody passes the door unchecked.",
    body: "Every request walks in through the lobby. You write the rules at the checkpoint: good requests go up, bad ones bounce with 422. Edit two lines and watch.",
    status: "open",
    align: "right",
  },
  {
    id: "router-station",
    level: "Floor 1 · The Router Station",
    title: "The junction room.",
    body: "Upstairs, a switchboard sends each request to the function that answers it. Paths, typed parameters, query strings, and why the order of your routes matters.",
    points: ["/trains/{id}", "?line=red&limit=5", "fixed paths first"],
    status: "open",
    align: "left",
  },
  {
    id: "signal-tower",
    level: "Floor 2 · The Signal Tower",
    title: "Where the wiring runs.",
    body: "Racks, trays and a riser to the roof antenna: every cable carries HTTP. Methods, headers, bodies and status codes, the language fetch() has been speaking all along.",
    points: ["GET · POST · PATCH · DELETE", "2xx · 4xx · 5xx", "every request stands alone"],
    status: "open",
    align: "right",
  },
  {
    id: "vaults",
    level: "Floor 3 · The Data Vaults",
    title: "Ask the vault the right question.",
    body: "Shelves of records behind a vault door. Write the SQL your handlers run: filter, sort, join, and never let a quote mark open the vault. SQLAlchemy and the N+1 problem come next, then the Citadel (auth) above.",
    points: ["SELECT · WHERE", "JOIN", "? parameters", "SQL injection"],
    status: "open",
    align: "left",
  },
  {
    id: "construction",
    level: "The roof",
    title: "The building is still going up.",
    body: "Caching, queues, production and architecture are the floors under the crane. Each one opens with a briefing, practice games and a checkpoint.",
    points: ["Speedway", "Factory", "Control Room", "Skyline"],
    status: "construction",
    align: "right",
  },
  // ---- the pull-out: full stack ----
  {
    id: "fullstack",
    level: "Back outside · Full stack",
    title: "Both sides, wired together.",
    body: "The glass closes over the frame, but now you can see the lines: every window is wired to the structure inside. Full stack is both ends at once, the screen someone taps and the server that answers it.",
    points: ["fetch() → route", "form → validation", "state ↔ database"],
    status: "soon",
    align: "left",
  },
  // the Choose your side picker, composed over the scene (story/ChooseChapter.tsx)
  { id: "choose", title: "Choose your side of the city.", body: "", align: "left" },
];
