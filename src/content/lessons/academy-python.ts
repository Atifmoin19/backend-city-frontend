import type { Lesson } from "./types";

export const academyPython: Lesson = {
  slug: "academy-python",
  title: "Python for JavaScript developers",
  steps: [
    {
      title: "Variables without let or const",
      byte: "You already know how to program. This is just a new accent.",
      body: [
        "Python has no `let`, `const` or `var`. You assign with `=` and the name exists. Types are still dynamic, like JavaScript.",
        "Backend code adds **type hints** after a colon. Python itself doesn't enforce them, but FastAPI and Pydantic read them to validate data, which is why you'll see them everywhere in this city.",
      ],
      code: {
        file: "variables.py",
        source: `name = "Neo"            # like: let name = "Neo"
age: int = 25           # type hint: age should be an int
is_admin: bool = False  # True / False are capitalised
nothing = None          # Python's null`,
        highlight: [2],
      },
      check: {
        prompt: "Which line is valid Python?",
        options: [
          { text: "let age = 25", code: true },
          { text: "age = 25", code: true },
          { text: "const age = 25", code: true },
        ],
        correct: 1,
        explain: "Python has no declaration keyword. `age = 25` creates the variable.",
      },
    },
    {
      title: "Dicts are objects, lists are arrays",
      byte: "JSON maps straight onto these two.",
      body: [
        "A `dict` is Python's version of a JavaScript object, and a `list` is an array. A JSON request body becomes dicts and lists.",
        "One big difference: you read dict keys with square brackets and quotes. Dot access (`user.name`) works on objects and classes, not on dicts.",
      ],
      code: {
        file: "data.py",
        source: `user = {"name": "Neo", "roles": ["admin", "editor"]}

user["name"]        # "Neo"
user["roles"][0]    # "admin"
len(user["roles"])  # 2  (like .length)`,
        highlight: [3],
      },
      check: {
        prompt: 'With `user = {"name": "Neo"}`, how do you read the name?',
        options: [
          { text: "user.name", code: true },
          { text: 'user["name"]', code: true },
        ],
        correct: 1,
        explain: "Dicts use square brackets. `user.name` would raise an AttributeError.",
      },
    },
    {
      title: "Functions and indentation",
      byte: "Indentation is the braces.",
      body: [
        "Functions start with `def`, and the body is whatever is indented under the colon. There are no curly braces, so indentation is part of the syntax: four spaces per level.",
        "`if`, `for` and `class` work the same way: a colon, then an indented block.",
      ],
      code: {
        file: "functions.py",
        source: `def greet(name: str) -> str:
    if name == "":
        return "Hello, stranger"
    return f"Hello, {name}"   # f-string, like \`Hello, \${name}\``,
        highlight: [1],
      },
      check: {
        prompt: "What marks where a Python function body ends?",
        options: [
          { text: "A closing curly brace" },
          { text: "The indentation going back out" },
          { text: "The word end" },
        ],
        correct: 1,
        explain: "When the indentation returns to the outer level, the block is over.",
      },
    },
    {
      title: "Classes with type hints",
      byte: "Pydantic models are just classes like these.",
      body: [
        "A class groups data and behaviour. In backend code you'll often write classes that are mostly a list of typed fields. That's exactly what a Pydantic model is.",
        "`BaseModel` in the brackets means the class extends it, like `class User extends BaseModel` in JavaScript.",
      ],
      code: {
        file: "models.py",
        source: `from pydantic import BaseModel

class User(BaseModel):     # extends BaseModel
    name: str
    age: int

neo = User(name="Neo", age=25)
neo.name                   # "Neo" (dot access works on classes)`,
        highlight: [3, 4, 5],
      },
      check: {
        prompt: "In `class User(BaseModel):`, what is `BaseModel`?",
        options: [
          { text: "A parameter passed to User" },
          { text: "The class User extends" },
          { text: "A decorator" },
        ],
        correct: 1,
        explain: "The brackets after a class name list what it inherits from.",
      },
    },
    {
      title: "async and await",
      byte: "Same idea as in JavaScript.",
      body: [
        "Python has `async` functions and `await`, and they mean what you expect: wait for slow work (a database, a network call) without blocking the server.",
        "FastAPI route handlers are usually `async def`. You'll see them in every district from here on.",
      ],
      code: {
        file: "handler.py",
        source: `@app.get("/users/{user_id}")
async def get_user(user_id: int):
    user = await db.fetch_user(user_id)   # like: await db.fetchUser(id)
    return user`,
        highlight: [2, 3],
      },
      check: {
        prompt: "What is `async def` closest to in JavaScript?",
        options: [{ text: "async function" }, { text: "new Promise" }, { text: "setTimeout" }],
        correct: 0,
        explain:
          "An `async def` function returns something you can await, just like an `async function`.",
      },
    },
  ],
};
