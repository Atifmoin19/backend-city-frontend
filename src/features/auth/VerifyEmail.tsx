"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { buttonClasses } from "@/components/ui/Button";
import { authApi } from "@/lib/api/auth";
import type { UserPublic } from "@/lib/api/types";

import { AccountAside } from "./AccountAside";
import { AuthShell } from "./AuthShell";
import { FormAlert } from "./FormAlert";
import { SESSION_KEY } from "./useSession";

/** Opens the link from the verification email (?token=...) once, then says how it went. */
export function VerifyEmail() {
  const token = useSearchParams().get("token") ?? "";
  const qc = useQueryClient();
  const verify = useMutation({
    mutationFn: () => authApi.verifyEmail(token),
    onSuccess: (u) =>
      qc.setQueryData<UserPublic | null>(SESSION_KEY, (old) =>
        old ? { ...old, is_verified: u.is_verified } : old,
      ),
  });
  const { mutate } = verify;
  const started = useRef(false);
  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    mutate();
  }, [token, mutate]);
  return (
    <AuthShell
      title="Verify your email"
      subtitle="One click, so we can reach you about your account."
      tagline={
        <>
          Badge checked. <span className="sign-text">Welcome to the city.</span>
        </>
      }
      aside={
        <AccountAside
          mood={verify.isSuccess ? "happy" : verify.isError ? "worried" : "thinking"}
          line={
            verify.isSuccess
              ? "Email confirmed. You're on the list."
              : "Checking the stamp on your badge…"
          }
          note="Verified emails can reset their password and hear when the Frontend District opens."
        />
      }
      footer={
        <Link href="/map" className="text-cyan underline">
          Go to the Backend District
        </Link>
      }
    >
      {!token ? (
        <FormAlert>This page needs the link from your verification email.</FormAlert>
      ) : verify.isSuccess ? (
        <div className="flex flex-col gap-4" role="status">
          <p className="flex items-center gap-2 font-semibold text-green">
            <Check aria-hidden className="size-5" /> Email verified
          </p>
          <Link href="/map" className={buttonClasses({ size: "lg", className: "w-full" })}>
            Continue your shift <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      ) : verify.isError ? (
        <FormAlert>
          This link is invalid, already used or expired. Sign in and use &ldquo;Resend&rdquo; in the
          banner for a new one.
        </FormAlert>
      ) : (
        <p className="text-text-2" role="status">
          Verifying…
        </p>
      )}
    </AuthShell>
  );
}
