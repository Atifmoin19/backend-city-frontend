import type { Lesson } from "./types";

export const dataVaultsSql: Lesson = {
  slug: "data-vaults-sql",
  title: "Ask the vault the right question",
  steps: [
    {
      title: "Tables, rows and a question",
      byte: "A database is a spreadsheet that answers questions.",
      body: [
        "Your server keeps its data in a **database**: tables with columns, one row per thing. The vault has an `items` table (id, name, vault, price) and a `vaults` table (name, floor, keeper).",
        "You don't loop over rows yourself. You ask the database a question in **SQL** and it hands back only the rows you asked for. That's faster and much less code than filtering in Python.",
      ],
      table: {
        head: ["items row", "means"],
        rows: [
          ["(1, 'Crown', 'North', 950)", "item 1 is a crown in the North vault, price 950"],
          ["(7, 'Rope', 'Deep', 8)", "item 7 is rope in the Deep vault, price 8"],
        ],
      },
      check: {
        prompt: "Where should filtering thousands of items happen?",
        options: [
          { text: "Fetch every row, then filter in a Python loop" },
          { text: "Ask the database for just the rows you need" },
        ],
        correct: 1,
        explain: "Right. Let the database filter; send back only what the request needs.",
      },
    },
    {
      title: "SELECT, WHERE, ORDER BY",
      byte: "SQL reads like a sentence.",
      body: [
        "`SELECT` names the columns, `FROM` the table, `WHERE` keeps matching rows and `ORDER BY` sorts them (add `DESC` for biggest first).",
        "In Python, `db.execute(sql)` runs the query. `.fetchall()` returns a list of tuples, `.fetchone()` one tuple, or `None` if nothing matched.",
      ],
      code: {
        file: "shelf.py",
        source: `rows = db.execute(
    "SELECT name, price FROM items WHERE price <= 50 ORDER BY price"
).fetchall()
# [('Rope', 8), ('Map', 12), ('Key', 25), ('Lantern', 40)]

row = db.execute("SELECT name FROM items WHERE id = 99").fetchone()
# None: no item 99`,
        highlight: [2],
      },
      check: {
        prompt: "Which query lists North's items, priciest first?",
        options: [
          { text: "SELECT name FROM items WHERE vault = 'North' ORDER BY price DESC", code: true },
          { text: "SELECT name FROM items ORDER BY vault = 'North'", code: true },
          { text: "SELECT DESC name FROM items WHERE 'North'", code: true },
        ],
        correct: 0,
        explain: "WHERE picks the rows, ORDER BY price DESC puts the priciest first.",
      },
    },
    {
      title: "Never paste input into SQL",
      byte: "A quote mark in the wrong place opens the whole vault.",
      body: [
        "If you build SQL with an f-string, the visitor's text becomes part of the query. A vault name like `North' OR '1'='1` turns your WHERE into always-true and leaks every row. That is **SQL injection**, one of the oldest attacks on the web.",
        "The fix: put a `?` where each value goes and pass the values separately, as a tuple. The database treats them as data, never as SQL.",
      ],
      code: {
        file: "ledger.py",
        source: `# Dangerous: the input becomes SQL
db.execute(f"SELECT name FROM items WHERE vault = '{vault}'")

# Safe: the input is only ever a value
db.execute("SELECT name FROM items WHERE vault = ?", (vault,))`,
        highlight: [5],
      },
      check: {
        prompt: "Why the comma in `(vault,)`?",
        options: [
          { text: "It makes a one-item tuple, which execute() expects" },
          { text: "It's a typo that Python ignores" },
        ],
        correct: 0,
        explain: "Right. `(vault)` is just `vault` in brackets; `(vault,)` is a tuple.",
      },
    },
    {
      title: "JOIN: two tables, one answer",
      byte: "The floor is in another table. JOIN brings it over.",
      body: [
        "`items` knows each item's vault; `vaults` knows each vault's floor. `JOIN ... ON` lines rows up where a column matches, so one query can answer with both.",
        "Short names after the table (`items i`, `vaults v`) keep it readable. When a query finds nothing, answer `404` with `HTTPException`, like a missing route.",
      ],
      code: {
        file: "floors.py",
        source: `row = db.execute(
    "SELECT i.name, v.floor FROM items i "
    "JOIN vaults v ON v.name = i.vault WHERE i.id = ?",
    (item_id,),
).fetchone()
if row is None:
    raise HTTPException(status_code=404)`,
        highlight: [3],
      },
      check: {
        prompt: "What does `JOIN vaults v ON v.name = i.vault` do?",
        options: [
          { text: "Pairs each item with the vault row whose name matches its vault" },
          { text: "Copies the vaults table into items" },
        ],
        correct: 0,
        explain: "Each item row gets its vault's columns alongside it, for this query only.",
      },
    },
  ],
};
