import type { Lesson } from "./types";

export const routerStationRoutes: Lesson = {
  slug: "router-station-routes",
  title: "Send every request to the right platform",
  steps: [
    {
      title: "A route is a method plus a path",
      byte: "Every train has a platform. The route is the sign above it.",
      diagram: "request-pipeline",
      body: [
        "A **route** tells FastAPI which function answers which request. It is the method (`GET`, `POST`…) plus the path (`/trains`). The decorator above a function registers it.",
        "When a request arrives, FastAPI looks for a route whose method and path match. No match on the path answers `404`; the path matches but the method doesn't, `405`.",
      ],
      code: {
        file: "station.py",
        source: `from fastapi import FastAPI

app = FastAPI()

@app.get("/trains")          # GET /trains lands here
async def list_trains():
    return {"trains": [101, 204]}

@app.post("/trains", status_code=201)   # POST /trains lands here
async def add_train():
    return {"id": 350}`,
        highlight: [5, 9],
      },
      check: {
        prompt: "With only the routes above, what does `DELETE /trains` answer?",
        options: [{ text: "404" }, { text: "405" }, { text: "200" }],
        correct: 1,
        explain:
          "The path /trains exists, but no route listens for DELETE on it: 405 Method Not Allowed.",
      },
    },
    {
      title: "Path parameters",
      byte: "Curly braces catch a piece of the path.",
      body: [
        "Write `{train_id}` in the path and add a parameter with the same name. FastAPI hands you that piece of the URL.",
        'The **type hint** is a check, too: `train_id: int` turns `"7"` into `7`, and `/trains/abc` bounces with `422` before your code runs.',
      ],
      code: {
        file: "station.py",
        source: `@app.get("/trains/{train_id}")
async def get_train(train_id: int):
    return {"train": train_id}

# GET /trains/7    -> 200 {"train": 7}
# GET /trains/abc  -> 422 (not an int)`,
        highlight: [1, 2],
      },
      check: {
        prompt: "Which route catches `GET /stations/central/trains`?",
        options: [
          { text: '@app.get("/stations/{name}/trains")', code: true },
          { text: '@app.get("/stations/trains/{name}")', code: true },
        ],
        correct: 0,
        explain: "The braces sit exactly where the changing part of the path is.",
      },
    },
    {
      title: "Query parameters",
      byte: "Everything after the question mark is optional extras.",
      body: [
        "A function parameter that is **not** in the path becomes a **query parameter**: `/departures?line=red&limit=5`.",
        'Give it a default and it becomes optional. `line: str | None = None` means "maybe not sent"; `limit: int = 10` means "10 unless told otherwise". Types still apply: `?limit=abc` bounces with 422.',
      ],
      code: {
        file: "station.py",
        source: `@app.get("/departures")
async def departures(line: str | None = None, limit: int = 10):
    return board(line, limit)

# /departures              -> line=None, limit=10
# /departures?line=red     -> line="red", limit=10
# /departures?limit=abc    -> 422`,
        highlight: [2],
      },
      check: {
        prompt: "`async def search(q: str):` with no default. What does `GET /search` answer?",
        options: [{ text: "200 with q = None" }, { text: "422: q is required" }],
        correct: 1,
        explain: "No default means required. Add `= None` (and allow None) to make it optional.",
      },
    },
    {
      title: "Order matters",
      byte: "The first matching sign wins. Fixed signs go first.",
      body: [
        "FastAPI checks routes **top to bottom** and takes the first one that matches. `/trains/{train_id}` also matches `/trains/next`, so if it comes first, `next` is treated as a train ID (and bounces with 422 because it isn't an int).",
        "Declare fixed paths like `/trains/next` **before** paths with parameters.",
      ],
      code: {
        file: "station.py",
        source: `@app.get("/trains/next")          # fixed path first
async def next_train():
    return {"route": "next"}

@app.get("/trains/{train_id}")    # then the parameter path
async def get_train(train_id: int):
    return {"route": "one", "id": train_id}`,
        highlight: [1, 5],
      },
      check: {
        prompt:
          "If the `{train_id}` route were declared first, what would `GET /trains/next` answer?",
        options: [{ text: '200 {"route": "next"}', code: true }, { text: "422" }],
        correct: 1,
        explain: '"next" reaches the int route first and fails the type check.',
      },
    },
    {
      title: "Your shift",
      byte: "Two practice runs, then the dispatcher's exam.",
      body: [
        "**Platform Paths**: a route with a typed path parameter. **Query Filters**: optional query parameters with defaults.",
        "Then the **Route Dispatcher** checkpoint: several routes at once, graded on the server with hidden requests. A request counts only when it reaches the right handler, so the log also checks the JSON that comes back.",
      ],
    },
  ],
};
