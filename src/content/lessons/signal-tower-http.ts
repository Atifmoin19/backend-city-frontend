import type { Lesson } from "./types";

export const signalTowerHttp: Lesson = {
  slug: "signal-tower-http",
  title: "How a request travels",
  steps: [
    {
      title: "Client and server",
      byte: "Every tower in this city speaks one language: HTTP.",
      diagram: "http-exchange",
      body: [
        "Your frontend is the **client**. It sends a **request** and waits. The backend is the **server**. It reads the request, does the work, and sends back a **response**.",
        'When you call `fetch("/api/signup")`, this is what happens on the other end. The whole curriculum is about what the server does in between.',
      ],
      check: {
        prompt: "Who starts an HTTP exchange?",
        options: [
          { text: "The client sends a request" },
          { text: "The server pushes a response first" },
        ],
        correct: 0,
        explain: "The client always asks first; the server answers.",
      },
    },
    {
      title: "Anatomy of a request",
      byte: "Four parts. Learn them once, use them forever.",
      body: [
        "A request has a **method** (what to do), a **path** (which resource), **headers** (metadata such as content type or auth token) and an optional **body** (the data, usually JSON).",
      ],
      code: {
        file: "raw HTTP request",
        source: `POST /signup HTTP/1.1              <- method + path
Host: backend.city
Content-Type: application/json     <- headers
Authorization: Bearer eyJhbGci...

{"username": "neo", "age": 25}     <- body`,
        highlight: [1, 6],
      },
      check: {
        prompt: "Which part carries the JSON data?",
        options: [{ text: "The path" }, { text: "The headers" }, { text: "The body" }],
        correct: 2,
        explain:
          "The body carries the data. Headers describe it (for example Content-Type: application/json).",
      },
    },
    {
      title: "Methods say what to do",
      byte: "Same path, different method, different meaning.",
      body: [
        "The method tells the server the intent. `GET /users/7` reads user 7; `DELETE /users/7` removes it.",
      ],
      table: {
        head: ["Method", "Means"],
        rows: [
          ["GET", "read data; never changes anything"],
          ["POST", "create something new"],
          ["PUT", "replace something completely"],
          ["PATCH", "change part of something"],
          ["DELETE", "remove something"],
        ],
      },
      check: {
        prompt: "A learner updates only their display name. Which method fits best?",
        options: [{ text: "GET" }, { text: "PATCH" }, { text: "DELETE" }],
        correct: 1,
        explain: "PATCH changes part of a resource. PUT would replace the whole profile.",
      },
    },
    {
      title: "Status codes say what happened",
      byte: "Read the first digit and you know who to blame.",
      diagram: "status-families",
      body: [
        "Every response starts with a three-digit status code. These are the ones you'll meet most:",
      ],
      table: {
        head: ["Code", "Means"],
        rows: [
          ["200 OK", "it worked, here is the data"],
          ["201 Created", "a new thing was created"],
          ["400 Bad Request", "the request is malformed"],
          ["401 Unauthorized", "you're not logged in"],
          ["403 Forbidden", "logged in, but not allowed"],
          ["404 Not Found", "that resource doesn't exist"],
          ["422 Unprocessable Content", "valid JSON, but the data breaks the rules"],
          ["500 Internal Server Error", "the server's code crashed"],
        ],
      },
      check: {
        prompt: "A visitor who isn't logged in opens their profile. Which status fits?",
        options: [{ text: "401" }, { text: "403" }, { text: "404" }],
        correct: 0,
        explain:
          "401 means we don't know who you are. 403 means we know, and the answer is still no.",
      },
    },
    {
      title: "Every request stands alone",
      byte: "The server forgets you the moment it answers.",
      body: [
        "HTTP is **stateless**: the server doesn't remember the previous request. Anything it needs, such as who you are, must come with each request, usually in a cookie or an `Authorization` header.",
        "That's why the same backend can run on many machines at once. You'll use this in the Citadel (auth) and the Skyline (scaling).",
      ],
      check: {
        prompt: "How does the server know who sent the second request after you log in?",
        options: [
          { text: "It remembers the first request" },
          { text: "A cookie or token is sent with every request" },
        ],
        correct: 1,
        explain:
          "Identity travels with every request. The server keeps no memory of the conversation.",
      },
    },
  ],
};
