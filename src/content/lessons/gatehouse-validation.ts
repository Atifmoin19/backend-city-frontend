import type { Lesson } from "./types";

export const gatehouseValidation: Lesson = {
  slug: "gatehouse-validation",
  title: "Validate what comes through the gate",
  steps: [
    {
      title: "Never trust the request",
      byte: "Everything that reaches your server was written by a stranger.",
      diagram: "gate-traffic",
      body: [
        "On the frontend you validate forms with `required`, `minLength` or a Zod schema. That protects honest users from typos. It does not protect your server.",
        "Anyone can skip your form and send a request with `curl`, Postman or DevTools. The server only ever sees the raw request, so the server must check every field again, every time.",
        "In the Backend District that checkpoint is the Gatehouse. Good requests get in (2xx), bad ones bounce (4xx) before they touch your code.",
      ],
      check: {
        prompt:
          "Your signup form has `min=13` on the age input. Is the server safe from a 5-year-old signing up?",
        options: [
          { text: "Yes, the browser blocks it" },
          { text: "No, anyone can send the request without the form" },
        ],
        correct: 1,
        explain:
          "Right. Browser checks are a convenience for users. The server has to validate the request itself.",
      },
    },
    {
      title: "Describe the request with a model",
      byte: "A Pydantic model is a guest list for the fields you accept.",
      diagram: "request-pipeline",
      body: [
        "In FastAPI you describe the JSON body as a class that extends `BaseModel`. Each annotated attribute is a field the request must contain, with a type.",
        "When a request arrives, FastAPI parses the JSON into that model before your handler runs. If a field is missing or has the wrong type, FastAPI answers `422` for you and your handler never runs.",
      ],
      code: {
        file: "signup.py",
        source: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class SignupRequest(BaseModel):
    username: str
    age: int

@app.post("/signup", status_code=201)
async def signup(body: SignupRequest):
    return {"welcome": body.username}`,
        highlight: [6, 7, 8],
      },
      check: {
        prompt: "With the model above, which request bounces with 422?",
        options: [
          { text: '{"username": "neo", "age": 25}', code: true },
          { text: '{"username": "neo", "age": "old"}', code: true },
          { text: '{"username": "neo", "age": 5}', code: true },
        ],
        correct: 1,
        explain:
          '"old" is not an integer, so it bounces. But age 5 gets in: the model only checks the type, not the range. That is the hole you will plug next.',
      },
    },
    {
      title: "Add limits with Field()",
      byte: "Types check the shape. Field() checks the values.",
      body: [
        "`Field()` adds constraints to a field. Numbers get range limits, strings get length limits. Limits named `ge` and `le` are inclusive: the boundary value itself is allowed.",
      ],
      code: {
        file: "signup.py",
        source: `from pydantic import BaseModel, Field

class SignupRequest(BaseModel):
    username: str = Field(min_length=3, max_length=12)
    age: int = Field(ge=13, le=120)`,
        highlight: [4, 5],
      },
      table: {
        head: ["Constraint", "Means"],
        rows: [
          ["ge=13", "greater than or equal to 13 (13 is allowed)"],
          ["gt=13", "strictly greater than 13 (13 bounces)"],
          ["le=120", "less than or equal to 120"],
          ["lt=120", "strictly less than 120"],
          ["min_length=3", "string has at least 3 characters"],
          ["max_length=12", "string has at most 12 characters"],
        ],
      },
      check: {
        prompt: "With `age: int = Field(ge=13, le=120)`, which age bounces?",
        options: [{ text: "13" }, { text: "120" }, { text: "121" }],
        correct: 2,
        explain:
          "13 and 120 are exactly on the limits, and ge/le include them. 121 is one past the maximum, so it bounces.",
      },
    },
    {
      title: "Read the status code",
      byte: "The first digit tells you who is to blame.",
      diagram: "status-families",
      body: [
        "When validation fails, FastAPI returns `422 Unprocessable Content` with a list saying which field failed and why. The client sent bad data: that is a 4xx, the client's fault.",
        "If your own code throws an exception, the client gets `500 Internal Server Error`: that is a 5xx, your fault. In the city, 4xx packets bounce off the gate and 5xx packets make your server spark.",
      ],
      code: {
        file: "response 422",
        source: `{
  "detail": [
    {
      "type": "greater_than_equal",
      "loc": ["body", "age"],
      "msg": "Input should be greater than or equal to 13",
      "input": 5
    }
  ]
}`,
      },
      check: {
        prompt:
          "Your handler reads `body.nickname`, but the model has no such field. What does the client get?",
        options: [
          { text: "422, bad request data" },
          { text: "500, the server crashed" },
          { text: "201, created" },
        ],
        correct: 1,
        explain:
          "The request itself was fine. Your code crashed, so it's a 500. Keep the field names in the handler and the model in sync.",
      },
    },
    {
      title: "Your shift",
      byte: "Your turn. I'll be right there if you need a hint.",
      body: [
        "Two practice games first: **Ticket Booth** (number limits) and **Badge Check** (text limits). You only edit the highlighted lines between the edit markers.",
        "Press Run and watch the traffic. Practice runs in your browser as often as you like. When both practice games are cleared, the checkpoint unlocks.",
        "The checkpoint, **Guard the Signup Gate**, uses a new variant with different field names and limits, and hidden requests that test exactly on and just past every boundary. You need 70% to clear the Gatehouse.",
      ],
    },
  ],
};
