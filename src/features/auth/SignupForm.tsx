"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { ArrowRight, Mail, ShieldCheck, User } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { TextField } from "@/components/ui/TextField";
import { sideByTrack } from "@/content/sides";
import { tracksApi } from "@/lib/api/tracks";
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

  const goal = sideByTrack(useSearchParams().get("goal"))?.track;
  const onSubmit = form.handleSubmit(async (data) => {
    setFormError(null);
    try {
      await register.mutateAsync(data);
      // Picked a side on the homepage ("Notify me" / "Start"): save it before orientation
      if (goal) await tracksApi.chooseGoal(goal).catch(() => undefined);
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
      tagline={
        <>
          Every request needs papers. <span className="sign-text">Get yours.</span>
        </>
      }
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
          icon={<User />}
          placeholder="How the city should call you"
          autoComplete="nickname"
          hint="Shown on the weekly leaderboard."
          error={errors.display_name?.message}
          {...form.register("display_name")}
        />
        <TextField
          label="Email"
          type="email"
          icon={<Mail />}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...form.register("email")}
        />
        <PasswordField
          label="Password"
          autoComplete="new-password"
          placeholder="8 characters or more"
          strengthOf={values.password ?? ""}
          error={errors.password?.message}
          {...form.register("password")}
        />
        {formError ? <FormAlert>{formError}</FormAlert> : null}
        {slow ? (
          <FormAlert tone="info">
            Waking up the server… this is literally what a cold start is.
          </FormAlert>
        ) : null}
        <Button type="submit" size="lg" loading={register.isPending} className="mt-2 w-full">
          Start your first shift <ArrowRight aria-hidden className="size-4" />
        </Button>
        <p className="flex items-center justify-center gap-2 text-xs text-text-3">
          <ShieldCheck aria-hidden className="size-3.5 text-green" /> Free in early access. Password
          stored as an Argon2 hash.
        </p>
      </form>
    </AuthShell>
  );
}
