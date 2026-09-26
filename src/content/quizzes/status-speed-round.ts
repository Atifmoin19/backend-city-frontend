import type { Quiz, QuizItem } from "./types";

const code = (text: string) => ({ text, code: true });

/** Four options: the right code plus three neighbours from the same list. */
function item(prompt: string, answer: string, explain: string, near: string[]): QuizItem {
  const options = [answer, ...near].slice(0, 4).map(code);
  return { prompt, options, correct: 0, explain };
}

export const statusSpeedRound: Quiz = {
  slug: "status-speed-round",
  title: "Status Code Speed Round",
  kind: "speed",
  district: "signal-tower",
  blurb:
    "60 seconds, one outcome at a time: send back the right status code. Chain answers for combos.",
  seconds: 60,
  draw: 14,
  items: [
    item(
      "A page loaded fine and returns the user's profile.",
      "200",
      "200 OK: the request worked and the body has the answer.",
      ["201", "204", "302"],
    ),
    item("`POST /users` created a new account.", "201", "201 Created: something new exists now.", [
      "200",
      "204",
      "202",
    ]),
    item(
      "`DELETE /posts/7` worked; there's nothing to send back.",
      "204",
      "204 No Content: success with an empty body.",
      ["200", "201", "404"],
    ),
    item(
      "The JSON body is broken: a missing closing brace.",
      "400",
      "400 Bad Request: the server can't even read it.",
      ["422", "500", "415"],
    ),
    item(
      "The body parses, but `age` is `-3`.",
      "422",
      "422 Unprocessable: readable, but the values break the rules. FastAPI's validation error.",
      ["400", "409", "403"],
    ),
    item(
      "No login token at all on a protected route.",
      "401",
      "401 Unauthorized: we don't know who you are. Log in.",
      ["403", "400", "404"],
    ),
    item(
      "Logged in as a cadet, trying to delete another user.",
      "403",
      "403 Forbidden: we know who you are, and you're not allowed.",
      ["401", "404", "405"],
    ),
    item(
      "`GET /trains/999` and train 999 doesn't exist.",
      "404",
      "404 Not Found: nothing at that address.",
      ["400", "410", "422"],
    ),
    item(
      "`PUT /users` on a route that only accepts GET and POST.",
      "405",
      "405 Method Not Allowed: the path exists, that method doesn't.",
      ["404", "403", "400"],
    ),
    item(
      "Signing up with an email that's already registered.",
      "409",
      "409 Conflict: it clashes with what's already there.",
      ["422", "400", "403"],
    ),
    item(
      "The same client sent 500 requests in one minute.",
      "429",
      "429 Too Many Requests: slow down (rate limit).",
      ["503", "403", "400"],
    ),
    item(
      "The handler divided by zero and crashed.",
      "500",
      "500 Internal Server Error: the server's own code failed. Never the client's fault.",
      ["400", "422", "503"],
    ),
    item(
      "`PATCH /orders/4` updated it and returns the new order.",
      "200",
      "200 OK with the updated resource in the body.",
      ["201", "204", "202"],
    ),
    item(
      'A form sent `quantity: "lots"` where a number is required.',
      "422",
      "422: the body is valid JSON, the value just isn't a number.",
      ["400", "500", "409"],
    ),
    item("An expired login token.", "401", "401: the token no longer proves who you are.", [
      "403",
      "404",
      "400",
    ]),
    item("A typo in the URL: `/userz/1`.", "404", "404: no route matches that path.", [
      "405",
      "400",
      "500",
    ]),
    item(
      "A database query failed because the server lost its connection.",
      "500",
      "500 (or 503): the fault is on the server's side.",
      ["404", "400", "409"],
    ),
  ],
};
