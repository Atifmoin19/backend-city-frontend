import { StatusLight } from "@/components/ui/StatusLight";

const ROWS = [
  {
    status: "pass" as const,
    code: "2xx",
    title: "Success",
    body: "201 Created, 200 OK. The packet got in.",
  },
  {
    status: "bounce" as const,
    code: "4xx",
    title: "Client's fault",
    body: "422 invalid data, 404 not found. Bounced at the gate.",
  },
  {
    status: "crash" as const,
    code: "5xx",
    title: "Server's fault",
    body: "500: your code crashed. The tower sparks.",
  },
];

export function StatusFamilies() {
  return (
    <ul className="grid gap-2 sm:grid-cols-3">
      {ROWS.map((r) => (
        <li key={r.code} className="rounded-md border border-line bg-bg-1 px-3 py-2.5">
          <StatusLight status={r.status}>
            <span className="font-mono">{r.code}</span> {r.title}
          </StatusLight>
          <p className="mt-1 text-sm text-text-2">{r.body}</p>
        </li>
      ))}
    </ul>
  );
}
