"use client";

import { useMutation } from "@tanstack/react-query";
import { MailWarning, X } from "lucide-react";
import { useState } from "react";

import { useSession } from "@/features/auth/useSession";
import { authApi } from "@/lib/api/auth";

const KEY = "bc-verify-banner-hidden";

function hiddenThisSession(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** Slim bar until the learner verifies their email, with a resend button. */
export function VerifyBanner() {
  const { data: user } = useSession();
  const [hidden, setHidden] = useState(hiddenThisSession);
  const resend = useMutation({ mutationFn: authApi.resendVerification });
  if (!user || user.is_verified || hidden) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-amber/30 bg-amber/[0.06] px-4 py-2 text-sm sm:px-6 lg:px-8">
      <MailWarning aria-hidden className="size-4 text-amber" />
      <span className="text-text-1">
        Verify your email: we sent a link to <span className="font-semibold">{user.email}</span>.
      </span>
      {resend.isSuccess ? (
        <span className="text-green" role="status">
          Sent. Check your inbox.
        </span>
      ) : (
        <button
          type="button"
          onClick={() => resend.mutate()}
          disabled={resend.isPending}
          className="font-semibold text-cyan underline-offset-4 hover:underline disabled:opacity-60"
        >
          {resend.isError ? "Try again" : "Resend"}
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          try {
            sessionStorage.setItem(KEY, "1");
          } catch {
            // storage blocked: hidden until reload
          }
          setHidden(true);
        }}
        className="ml-auto rounded-sm p-1 text-text-3 hover:text-text-1"
        aria-label="Hide until next visit"
      >
        <X aria-hidden className="size-4" />
      </button>
    </div>
  );
}
