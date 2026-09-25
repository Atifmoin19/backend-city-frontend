"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSlowPending } from "@/lib/useSlowPending";

import { AuthShell } from "./AuthShell";
import { mapAuthError } from "./errors";
import { FormAlert } from "./FormAlert";
import { GateAside } from "./GateAside";
import { RequestPreview } from "./RequestPreview";
import { signupSchema, type SignupValues } from "./schemas";
import { useRegister } from "./useSession";

const FIELDS = ["display_name", "email", "password"] as const;

export function SignupForm() {
  const router = useRouter();
  const register = useRegister();
  const slow = useSlowPending(register.isPending);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: { display_name: "", email: "", password: "" },
  });
  const values = useWatch({ control: form.control });
  const { errors, touchedFields } = form.formState;

  const onSubmit = form.handleSubmit(async (data) => {
    setFormError(null);
    try {
      await register.mutateAsync(data);
      router.push("/welcome");
    } catch (err) {
      for (const e of mapAuthError(err)) {
        if (e.field && (FIELDS as readonly string[]).includes(e.field)) {
          form.setError(e.field as keyof SignupValues, { message: e.message });
        } else setFormError(e.message);
      }
    }
  });

  const ok = (k: keyof SignupValues) => signupSchema.shape[k].safeParse(values[k] ?? "").success;
  const hasErrors = Object.keys(errors).length > 0 || !!formError;
  const outcome = register.isPending
    ? "sending"
    : register.isSuccess
      ? "pass"
      : hasErrors
        ? "bounce"
        : "idle";
  const line =
    outcome === "pass"
      ? "Papers check out. Welcome to the city."
      : outcome === "bounce"
        ? "Hold it. Something in there won't get past me."
        : "Name, email, password. I check everything.";

  return (
    <AuthShell
      title="Get your city badge"
      subtitle="New engineer on the night shift? Sign up and the first district unlocks right away."
      footer={
        <>
          Already have a badge?{" "}
          <Link href="/login" className="text-cyan underline">
            Log in
          </Link>
        </>
      }
      aside={
        <GateAside
          mood={outcome === "pass" ? "happy" : outcome === "bounce" ? "worried" : "idle"}
          line={line}
        >
          <RequestPreview
            method="POST"
            path="/auth/register"
            outcome={outcome}
            fields={FIELDS.map((name) => ({
              name,
              value: values[name] ?? "",
              valid: ok(name),
              touched: !!touchedFields[name],
              secret: name === "password",
            }))}
          />
        </GateAside>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <TextField
          label="Display name"
          autoComplete="nickname"
          hint="Shown on the weekly leaderboard."
          error={errors.display_name?.message}
          {...form.register("display_name")}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...form.register("email")}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="8 characters or more."
          error={errors.password?.message}
          {...form.register("password")}
        />
        {formError ? <FormAlert>{formError}</FormAlert> : null}
        {slow ? (
          <FormAlert tone="info">
            Waking up the server… this is literally what a cold start is.
          </FormAlert>
        ) : null}
        <Button type="submit" size="lg" loading={register.isPending} className="mt-1">
          Start your first shift
        </Button>
      </form>
    </AuthShell>
  );
}
