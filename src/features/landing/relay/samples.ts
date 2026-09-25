/** The three requests the homepage relay can send, and what the server does with each. */
export interface RelaySample {
  id: string;
  chip: string;
  body: string;
  status: 201 | 422;
  statusText: string;
  /** Server line that decides the outcome, and the note shown beside it. */
  line: number;
  note: string;
}

export const SAMPLES: RelaySample[] = [
  {
    id: "young",
    chip: "age: 5",
    body: `{ username: "neo", age: 5 }`,
    status: 422,
    statusText: "Unprocessable",
    line: 2,
    note: "5 < 13, bounced",
  },
  {
    id: "ok",
    chip: "age: 25",
    body: `{ username: "neo", age: 25 }`,
    status: 201,
    statusText: "Created",
    line: 6,
    note: "papers check out",
  },
  {
    id: "short",
    chip: `username: "x"`,
    body: `{ username: "x", age: 30 }`,
    status: 422,
    statusText: "Unprocessable",
    line: 1,
    note: "1 char < 3, bounced",
  },
];

export const clientLines = (s: RelaySample, status: string) => [
  `const res = await fetch("/api/signup", {`,
  `  method: "POST",`,
  `  body: JSON.stringify(${s.body}),`,
  `});`,
  `res.status; // ${status}`,
];

export const SERVER_LINES = [
  `class SignupRequest(BaseModel):`,
  `    username: str = Field(min_length=3)`,
  `    age: int = Field(ge=13, le=120)`,
  ``,
  `@app.post("/signup", status_code=201)`,
  `async def signup(body: SignupRequest):`,
  `    return {"welcome": body.username}`,
];
