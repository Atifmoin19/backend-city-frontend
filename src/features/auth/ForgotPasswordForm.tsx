"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { authApi } from "@/lib/api/auth";

import { AccountAside } from "./AccountAside";
import { AuthShell } from "./AuthShell";
import { FormAlert } from "./FormAlert";

/** Ask for a reset link. The answer is the same whether or not the email has an account. */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const send = useMutation({ mutationFn: () => authApi.forgotPassword(email.trim()) });
  const valid = /^\S+@\S+\.\S+$/.test(email.trim());
  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="We'll email you a link to set a new one. It works for an hour."
      tagline={
        <>
          Lost your badge? <span className="sign-text">We&apos;ll print a new one.</span>
        </>
      }
      aside={
        <AccountAside
          mood="thinking"
          line="Tell me where to send the new badge."
          note="Reset links work once and expire after an hour. Setting a new password signs you out on every device."
        />
      }
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="text-cyan underline">
            Log in
          </Link>
        </>
      }
    >
      {send.isSuccess ? (
        <div className="flex flex-col gap-4" role="status">
          <p className="flex items-center gap-2 font-semibold text-green">
            <MailCheck aria-hidden className="size-5" /> Check your inbox
          </p>
          <p className="text-text-2">
            If an account uses <span className="text-text-1">{email.trim()}</span>, a reset link is
            on its way. It can take a minute; check spam too.
          </p>
          <Button variant="ghost" onClick={() => send.reset()}>
            Use a different email
          </Button>
        </div>
      ) : (
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) send.mutate();
          }}
        >
          <TextField
            label="Email"
            type="email"
            icon={<Mail />}
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {send.isError ? (
            <FormAlert>
              Couldn&apos;t send the link right now. Try again in a few minutes.
            </FormAlert>
          ) : null}
          <Button
            type="submit"
            size="lg"
            loading={send.isPending}
            disabled={!valid}
            className="w-full"
          >
            Email me a reset link <ArrowRight aria-hidden className="size-4" />
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
