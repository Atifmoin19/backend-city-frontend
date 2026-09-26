"use client";

import { useMutation } from "@tanstack/react-query";
import { Check, MessageSquarePlus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { insightsApi, type FeedbackKind } from "@/lib/api/insights";
import { cn } from "@/lib/cn";

const KINDS: { key: FeedbackKind; label: string }[] = [
  { key: "bug", label: "Something's broken" },
  { key: "content", label: "A lesson or game is unclear" },
  { key: "idea", label: "An idea" },
  { key: "other", label: "Something else" },
];

/** "Send feedback": a native modal dialog (Esc closes, focus is trapped by the browser). */
export function FeedbackDialog({ className, onOpen }: { className?: string; onOpen?: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const path = usePathname();
  const [kind, setKind] = useState<FeedbackKind>("bug");
  const [message, setMessage] = useState("");
  const send = useMutation({
    mutationFn: () => {
      const game = path.match(/^\/play\/([a-z0-9-]+)/)?.[1];
      return insightsApi.sendFeedback({ kind, message, page: path.slice(0, 200), game_slug: game });
    },
    onSuccess: () => setMessage(""),
  });
  const open = () => {
    send.reset();
    onOpen?.();
    dialog.current?.showModal();
  };
  return (
    <>
      <button type="button" onClick={open} className={className}>
        <MessageSquarePlus aria-hidden className="size-4 text-purple" /> Send feedback
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="feedback-title"
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-xl border border-line-strong bg-bg-2 p-0 text-text-1 shadow-panel backdrop:bg-black/60"
      >
        {send.isSuccess ? (
          <div className="p-6">
            <p className="flex items-center gap-2 font-semibold text-green">
              <Check aria-hidden className="size-5" /> Thanks, the team will read it.
            </p>
            <Button className="mt-5" variant="ghost" onClick={() => dialog.current?.close()}>
              Close
            </Button>
          </div>
        ) : (
          <form
            className="p-6"
            onSubmit={(e) => {
              e.preventDefault();
              send.mutate();
            }}
          >
            <h2 id="feedback-title" className="font-display text-lg font-semibold">
              Send feedback
            </h2>
            <fieldset className="mt-4">
              <legend className="text-sm text-text-2">What is it about?</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {KINDS.map((k) => (
                  <label
                    key={k.key}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm",
                      kind === k.key
                        ? "border-cyan bg-bg-3"
                        : "border-line hover:border-line-strong",
                    )}
                  >
                    <input
                      type="radio"
                      name="kind"
                      value={k.key}
                      checked={kind === k.key}
                      onChange={() => setKind(k.key)}
                      className="accent-(--bc-cyan)"
                    />
                    {k.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="mt-4 block text-sm text-text-2" htmlFor="feedback-message">
              Tell us more
            </label>
            <textarea
              id="feedback-message"
              required
              minLength={3}
              maxLength={2000}
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full rounded-md border border-line-strong bg-bg-1 p-3 text-sm text-text-1 focus:border-cyan focus:outline-none"
            />
            {send.isError ? (
              <p className="mt-2 text-sm text-red" role="alert">
                Couldn&apos;t send it. Try again in a minute.
              </p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="quiet" onClick={() => dialog.current?.close()}>
                Cancel
              </Button>
              <Button type="submit" loading={send.isPending} disabled={message.trim().length < 3}>
                Send
              </Button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
