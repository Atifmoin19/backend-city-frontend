import { StatusLight, type Status } from "@/components/ui/StatusLight";
import type { TestResult } from "@/engine/harness/protocol";
import { outcomeOf } from "@/engine/visualizer/outcome";
import type { PublicTest } from "@/lib/api/types";

function statusOf(r: TestResult): Status {
  if (!r.passed) return "crash";
  return outcomeOf(r.status) === "bounced" ? "bounce" : "pass";
}

/** `POST /signup {"age": 5}` or `GET /trains/7?line=red`: what the city actually sends. */
function requestLine({ request: r }: PublicTest): string {
  const query = r.query ? `?${r.query}` : "";
  const json = r.json === undefined ? "" : ` ${JSON.stringify(r.json)}`;
  return `${r.method} ${r.path}${query}${json}`;
}

/** One line per public request: what it sends, what it should get, what your server did. */
export function RequestLog({
  tests,
  results,
}: {
  tests: PublicTest[];
  results: TestResult[] | null;
}) {
  return (
    <div className="rounded-lg border border-line bg-bg-2">
      <table className="w-full table-fixed text-sm">
        <caption className="sr-only">Requests the city sends to your server</caption>
        <thead className="text-left text-[0.72rem] text-text-3">
          <tr className="border-b border-line">
            <th scope="col" className="px-3.5 py-2 font-medium">
              Request
            </th>
            <th scope="col" className="w-20 py-2 text-right font-medium">
              Should get
            </th>
            <th scope="col" className="w-24 py-2 pr-3.5 text-right font-medium">
              Your server
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {tests.map((t, i) => {
            const r = results?.[i];
            const line = requestLine(t);
            const expectBody = t.expect_body == null ? "" : JSON.stringify(t.expect_body);
            return (
              <tr key={t.name}>
                <td
                  className="truncate px-3.5 py-2"
                  title={`${line}${expectBody ? ` → ${expectBody}` : ""}`}
                >
                  <span className="text-text-1">{t.name}</span>{" "}
                  <span className="font-mono text-xs text-text-3">{line}</span>
                </td>
                <td
                  className="tabular py-2 text-right font-mono text-text-2"
                  title={expectBody ? `and the JSON contains ${expectBody}` : undefined}
                >
                  {t.expect_status}
                  {expectBody ? <span className="text-text-3">+</span> : null}
                </td>
                <td className="py-2 pr-3.5 text-right">
                  {r ? (
                    <StatusLight status={statusOf(r)} className="justify-end">
                      <span className="tabular font-mono">{r.status}</span>
                      <span className="sr-only">
                        {r.passed ? "as expected" : "not as expected"}
                      </span>
                    </StatusLight>
                  ) : (
                    <span className="text-xs text-text-3">not sent</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
