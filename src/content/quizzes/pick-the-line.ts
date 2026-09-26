import type { Quiz } from "./types";

const c = (text: string) => ({ text, code: true });

export const pickRoutes: Quiz = {
  slug: "pick-the-line-routes",
  title: "Pick the Line: Routes",
  kind: "pick",
  district: "router-station",
  blurb: "One line is missing from each handler. Pick the one that makes it work. Phone-friendly.",
  draw: 5,
  items: [
    {
      prompt:
        "Train ids are whole numbers. Which line makes `/trains/7` reach this handler with `train_id == 7`?",
      code: {
        file: "trains.py",
        source: `@app.get("/trains/{train_id}")\n# ???\n    return {"train": train_id}`,
        highlight: [2],
      },
      options: [
        c("async def train(train_id: int):"),
        c("async def train(id: int):"),
        c("async def train(train_id):"),
        c("async def train(trainId: int):"),
      ],
      correct: 0,
      explain:
        'The parameter name must match `{train_id}`; `: int` converts "7" and rejects "abc" with 422.',
    },
    {
      prompt: "`limit` should be optional with a default of 10. Pick the signature.",
      code: {
        file: "departures.py",
        source: `@app.get("/departures")\n# ???\n    return board(limit)`,
        highlight: [2],
      },
      options: [
        c("async def departures(limit: int = 10):"),
        c("async def departures(limit: int):"),
        c("async def departures(limit=int(10)):"),
        c("async def departures(limit: int | None):"),
      ],
      correct: 0,
      explain:
        "A default value makes a query parameter optional. Without one, FastAPI requires it.",
    },
    {
      prompt:
        "`/trains/latest` keeps hitting the `{train_id}` route and failing with 422. Which line goes first?",
      code: {
        file: "order.py",
        source: `# ???\nasync def latest(): ...\n\n@app.get("/trains/{train_id}")\nasync def train(train_id: int): ...`,
        highlight: [1],
      },
      options: [
        c('@app.get("/trains/latest")'),
        c('@app.get("/trains/{latest}")'),
        c('@app.post("/trains/latest")'),
        c('@app.get("/latest/trains")'),
      ],
      correct: 0,
      explain: "Routes match in order. Put the fixed path before the one with a parameter.",
    },
    {
      prompt: "Creating a train should answer 201. Pick the decorator.",
      code: {
        file: "create.py",
        source: `# ???\nasync def create(body: Train):\n    return save(body)`,
        highlight: [1],
      },
      options: [
        c('@app.post("/trains", status_code=201)'),
        c('@app.get("/trains", status_code=201)'),
        c('@app.post("/trains")'),
        c('@app.put("/trains/201")'),
      ],
      correct: 0,
      explain: "POST creates; `status_code=201` changes the default 200 to Created.",
    },
    {
      prompt: "The handler needs an optional `line` filter: `?line=red`, or nothing at all.",
      code: {
        file: "filter.py",
        source: `@app.get("/departures")\n# ???\n    return board(line)`,
        highlight: [2],
      },
      options: [
        c("async def departures(line: str | None = None):"),
        c("async def departures(line: str):"),
        c('async def departures(line: str = "red"):'),
        c("async def departures(*line):"),
      ],
      correct: 0,
      explain: '`str | None = None` means "maybe not sent"; a fixed default would always filter.',
    },
    {
      prompt: "Which line reads the `id` from `DELETE /orders/42`?",
      code: {
        file: "cancel.py",
        source: `# ???\nasync def cancel(order_id: int):\n    remove(order_id)`,
        highlight: [1],
      },
      options: [
        c('@app.delete("/orders/{order_id}", status_code=204)'),
        c('@app.delete("/orders?order_id", status_code=204)'),
        c('@app.delete("/orders/id", status_code=204)'),
        c('@app.get("/orders/{order_id}/delete")'),
      ],
      correct: 0,
      explain: "Curly braces in the path capture the value into the parameter with the same name.",
    },
  ],
};

export const pickGate: Quiz = {
  slug: "pick-the-line-gate",
  title: "Pick the Line: The Gate",
  kind: "pick",
  district: "gatehouse",
  blurb: "Pydantic rules, one missing line at a time. Pick the field that lets good requests in.",
  draw: 5,
  items: [
    {
      prompt: "Usernames are 3 to 20 characters.",
      code: {
        file: "signup.py",
        source: `class Signup(BaseModel):\n    # ???\n    email: EmailStr`,
        highlight: [2],
      },
      options: [
        c("    username: str = Field(min_length=3, max_length=20)"),
        c("    username: str = Field(ge=3, le=20)"),
        c("    username: str(3, 20)"),
        c("    username: Field(str, 3, 20)"),
      ],
      correct: 0,
      explain: "Text uses min_length / max_length. ge / le are for numbers.",
    },
    {
      prompt: "Age must be 13 or older.",
      code: {
        file: "signup.py",
        source: `class Signup(BaseModel):\n    username: str\n    # ???`,
        highlight: [3],
      },
      options: [
        c("    age: int = Field(ge=13)"),
        c("    age: int = Field(gt=13)"),
        c("    age: int = Field(min_length=13)"),
        c("    age: str = Field(ge=13)"),
      ],
      correct: 0,
      explain: "`ge=13` means >= 13. `gt=13` would bounce a 13-year-old.",
    },
    {
      prompt: "A badge code is exactly 6 characters.",
      code: {
        file: "badge.py",
        source: `class Badge(BaseModel):\n    # ???`,
        highlight: [2],
      },
      options: [
        c("    code: str = Field(min_length=6, max_length=6)"),
        c("    code: str = Field(length=6)"),
        c("    code: str = Field(max_length=6)"),
        c("    code: int = Field(ge=6, le=6)"),
      ],
      correct: 0,
      explain: '"Exactly" means both limits are the same number.',
    },
    {
      prompt: "`nickname` is optional: leaving it out is fine.",
      code: {
        file: "profile.py",
        source: `class Profile(BaseModel):\n    name: str\n    # ???`,
        highlight: [3],
      },
      options: [
        c("    nickname: str | None = None"),
        c("    nickname: str"),
        c("    nickname: None"),
        c("    nickname: str = Field(min_length=0)"),
      ],
      correct: 0,
      explain: "A default makes the field optional; `| None` allows null.",
    },
    {
      prompt: "Ticket quantity is 1 to 8.",
      code: {
        file: "tickets.py",
        source: `class Order(BaseModel):\n    show: str\n    # ???`,
        highlight: [3],
      },
      options: [
        c("    quantity: int = Field(ge=1, le=8)"),
        c("    quantity: int = Field(gt=1, lt=8)"),
        c("    quantity: int = Field(min_length=1, max_length=8)"),
        c("    quantity: str = Field(ge=1, le=8)"),
      ],
      correct: 0,
      explain: "ge / le include the edges, so 1 and 8 both get in.",
    },
    {
      prompt: "Which line makes the handler validate the body with the model?",
      code: {
        file: "gate.py",
        source: `@app.post("/signup", status_code=201)\n# ???\n    return {"ok": True}`,
        highlight: [2],
      },
      options: [
        c("async def signup(body: Signup):"),
        c("async def signup(body):"),
        c("async def signup(body: dict):"),
        c("async def signup(Signup):"),
      ],
      correct: 0,
      explain:
        "Typing the parameter with the model is what makes FastAPI validate (and 422 on failure).",
    },
  ],
};
