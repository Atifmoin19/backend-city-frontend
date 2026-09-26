import type { Lesson } from "./types";

export const dataVaultsWrites: Lesson = {
  slug: "data-vaults-writes",
  title: "Change the vault safely",
  steps: [
    {
      title: "INSERT: put a new row in",
      byte: "Same ? rule as reading. Especially for names like Captain's Log.",
      body: [
        "`INSERT INTO table (columns) VALUES (?, ?, ?)` adds a row. The values go in a tuple, exactly like a `SELECT` with parameters. A pasted name with an apostrophe would end the SQL string early and crash the request.",
        "After an insert, `cur.lastrowid` is the id the database gave the new row. Check that anything the row points at (like its vault) exists first, and answer `404` if not.",
      ],
      code: {
        file: "stock.py",
        source: `with db:
    cur = db.execute(
        "INSERT INTO items (name, vault, price) VALUES (?, ?, ?)",
        (body.name, body.vault, body.price),
    )
return {"id": cur.lastrowid, "name": body.name}`,
        highlight: [3],
      },
      check: {
        prompt: "What is `cur.lastrowid` after an INSERT?",
        options: [
          { text: "The id of the row that was just added" },
          { text: "How many rows the table has now" },
        ],
        correct: 0,
        explain: "Right. The database picks the id; lastrowid tells you which one.",
      },
    },
    {
      title: "GROUP BY: one answer per group",
      byte: "Count every vault in one trip, not one trip per vault.",
      body: [
        "`GROUP BY` folds rows into one per group; `COUNT()` and `SUM()` work per group. `HAVING` filters the groups (`WHERE` filters rows before grouping).",
        "A plain `JOIN` drops a vault with no items. `LEFT JOIN` keeps it, with `NULL` item columns: `COUNT(i.id)` skips the NULLs and `COALESCE(SUM(i.price), 0)` turns the empty sum into 0.",
        "Asking once per vault in a Python loop is the **N+1 problem**: one query for the list, then one more for each row. It's fine with 4 vaults and painfully slow with 4,000. One grouped query does it all.",
      ],
      code: {
        file: "census.py",
        source: `rows = db.execute(
    "SELECT v.name, COUNT(i.id), COALESCE(SUM(i.price), 0) FROM vaults v "
    "LEFT JOIN items i ON i.vault = v.name "
    "GROUP BY v.name ORDER BY v.floor"
).fetchall()
# [('Deep', 2, 708), ('North', 3, 1002), ('South', 2, 85), ('Attic', 0, 0)]`,
        highlight: [3],
      },
      check: {
        prompt: "Which keeps only vaults with at least 3 items?",
        options: [
          { text: "HAVING COUNT(i.id) >= 3", code: true },
          { text: "WHERE COUNT(i.id) >= 3", code: true },
        ],
        correct: 0,
        explain: "COUNT is only known after grouping, so the filter goes in HAVING.",
      },
    },
    {
      title: "Rules in the table",
      byte: "The database can refuse bad data by itself.",
      body: [
        "A **constraint** is a rule on a column: `NOT NULL`, `UNIQUE`, or `CHECK (gold BETWEEN 0 AND 1000)`. A write that breaks one fails with `IntegrityError`, whatever code sent it.",
        "`UPDATE` changes rows; `cur.rowcount` says how many it changed. `0` means nothing matched, which usually means the thing doesn't exist: answer `404`.",
      ],
      code: {
        file: "rules.py",
        source: `cur = db.execute(
    "UPDATE vaults SET gold = gold + ? WHERE name = ?", (amount, name)
)
if cur.rowcount == 0:
    raise HTTPException(status_code=404, detail="No such vault")`,
        highlight: [4],
      },
      check: {
        prompt: "An UPDATE changed 0 rows. What happened?",
        options: [{ text: "No row matched the WHERE" }, { text: "The database crashed" }],
        correct: 0,
        explain: "Nothing matched, so nothing changed. Usually a 404.",
      },
    },
    {
      title: "Transactions: all or nothing",
      byte: "Take out, put in. Both happen, or neither does.",
      body: [
        "Moving gold is two writes. If the second fails after the first succeeded, gold vanishes. A **transaction** groups writes: **commit** keeps them all, **rollback** undoes them all.",
        "`with db:` opens one: it commits when the block finishes and rolls back if anything inside raises, a `HTTPException` included. Catch `IntegrityError` outside the block, after the rollback, and answer `409 Conflict`.",
      ],
      code: {
        file: "transfer.py",
        source: `try:
    with db:  # commit at the end, roll back on any error
        take_out(body.from_vault, body.amount)
        put_in(body.to_vault, body.amount)
except IntegrityError:
    raise HTTPException(status_code=409, detail="The vault rules say no")`,
        highlight: [2],
      },
      check: {
        prompt:
          "The second write breaks a CHECK rule inside `with db:`. What happens to the first?",
        options: [
          { text: "It's rolled back too" },
          { text: "It stays, only the second is undone" },
        ],
        correct: 0,
        explain: "Right. The whole block is one transaction, so both are undone.",
      },
    },
  ],
};
