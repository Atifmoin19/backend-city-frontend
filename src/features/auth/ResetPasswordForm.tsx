"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button, buttonClasses } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { authApi } from "@/lib/api/auth";

import { AccountAside } from "./AccountAside";
import { AuthShell } from "./AuthShell";
import { FormAlert } from "./FormAlert";

/** Set a new password from the emailed link (?token=...). */
export function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const reset = useMutation({ mutationFn: () => authApi.resetPassword(token, password) });
  const tooShort = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && confirm !== password;
  const ready = password.length >= 8 && password.length <= 128 && confirm === password;
  return (
    <AuthShell
      title="Set a new password"
      subtitle="At least 8 characters. You'll be signed out everywhere else."
      tagline={
        <>
          New badge, <span className="sign-text">same city.</span>
        </>
      }
      aside={
        <AccountAside
          mood={reset.isSuccess ? "happy" : reset.isError ? "worried" : "idle"}
          line={
            reset.isSuccess ? "New badge printed. Welcome back." : "Pick something only you know."
          }
          note="Your progress, stars and badges are safe: only the password changes."
        />
      }
      footer={
        <>
          Link not working?{" "}
          <Link href="/forgot-password" className="text-cyan underline">
            Get a new one
          </Link>
        </>
      }
    >
      {!token ? (
        <FormAlert>This page needs the link from your reset email.</FormAlert>
      ) : reset.isSuccess ? (
        <div className="flex flex-col gap-4" role="status">
          <p className="flex items-center gap-2 font-semibold text-green">
            <Check aria-hidden className="size-5" /> Password changed
          </p>
          <Link href="/login" className={buttonClasses({ size: "lg", className: "w-full" })}>
            Log in <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      ) : (
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (ready) reset.mutate();
          }}
        >
          <PasswordField
            label="New password"
            autoComplete="new-password"
            value={password}
            strengthOf={password}
            error={tooShort ? "At least 8 characters" : undefined}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordField
            label="Confirm it"
            autoComplete="new-password"
            value={confirm}
            error={mismatch ? "The two passwords don't match" : undefined}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {reset.isError ? (
            <FormAlert>
              This link is invalid or has expired.{" "}
              <Link href="/forgot-password" className="underline">
                Send a new one
              </Link>
              .
            </FormAlert>
          ) : null}
          <Button
            type="submit"
            size="lg"
            loading={reset.isPending}
            disabled={!ready}
            className="w-full"
          >
            Save new password <ArrowRight aria-hidden className="size-4" />
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
