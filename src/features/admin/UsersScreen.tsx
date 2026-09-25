"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { SignHeading } from "@/components/ui/SignHeading";
import { StatusLight } from "@/components/ui/StatusLight";
import { adminApi } from "@/lib/api/admin";

const PAGE = 25;

export const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "never";

export function UsersScreen() {
  const [q, setQ] = useState("");
  const [offset, setOffset] = useState(0);
  const query = useDeferredValue(q.trim());
  const users = useQuery({
    queryKey: ["admin", "users", query, offset],
    queryFn: () => adminApi.users(query, offset),
    placeholderData: keepPreviousData,
  });
  const total = users.data?.total ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <SignHeading as="h1" className="text-3xl">
        Learners
      </SignHeading>
      <label className="relative mt-6 block max-w-md">
        <span className="sr-only">Search by email or name</span>
        <Search
          aria-hidden
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-3"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOffset(0);
          }}
          placeholder="Search by email or name"
          className="h-10 w-full rounded-md border border-line-strong bg-bg-1 pr-3 pl-9 text-sm text-text-1 focus:border-cyan focus:outline-none"
        />
      </label>
      <Panel className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[44rem] text-sm">
          <caption className="sr-only">Learners</caption>
          <thead className="text-left text-xs text-text-3">
            <tr className="border-b border-line">
              {[
                "Learner",
                "Role",
                "Topics passed",
                "Checkpoint tries",
                "Last active",
                "Joined",
              ].map((h) => (
                <th key={h} scope="col" className="px-4 py-2.5 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.data?.users.map((u) => (
              <tr key={u.id} className="hover:bg-bg-3/40">
                <td className="px-4 py-2.5">
                  <Link href={`/admin/users/${u.id}`} className="text-text-1 hover:text-cyan">
                    {u.display_name}
                  </Link>
                  <span className="block text-xs text-text-3">{u.email}</span>
                </td>
                <td className="px-4 py-2.5 text-text-2">
                  {u.is_blocked ? <StatusLight status="crash">Blocked</StatusLight> : u.role}
                </td>
                <td className="tabular px-4 py-2.5 text-text-2">{u.topics_passed}</td>
                <td className="tabular px-4 py-2.5 text-text-2">{u.checkpoint_attempts}</td>
                <td className="px-4 py-2.5 text-text-2">{when(u.last_active_at)}</td>
                <td className="px-4 py-2.5 text-text-2">{when(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.isPending ? <p className="px-4 py-6 text-text-2">Loading learners…</p> : null}
        {users.data && users.data.users.length === 0 ? (
          <p className="px-4 py-6 text-text-2">No learners match.</p>
        ) : null}
      </Panel>
      <div className="mt-4 flex items-center gap-3 text-sm text-text-2">
        <span className="tabular">
          {total ? `${offset + 1}–${Math.min(offset + PAGE, total)} of ${total}` : ""}
        </span>
        <Button
          variant="quiet"
          size="sm"
          disabled={offset === 0}
          onClick={() => setOffset(offset - PAGE)}
        >
          Previous
        </Button>
        <Button
          variant="quiet"
          size="sm"
          disabled={offset + PAGE >= total}
          onClick={() => setOffset(offset + PAGE)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
