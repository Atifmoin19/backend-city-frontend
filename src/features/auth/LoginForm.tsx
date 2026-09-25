"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { ArrowRight, Mail } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { TextField } from "@/components/ui/TextField";
import { useSlowPending } from "@/lib/useSlowPending";
import { useLearningStore } from "@/stores/learning";

import { AuthShell } from "./AuthShell";
import { mapAuthError } from "./errors";
import { FormAlert } from "./FormAlert";
import { GateAside } from "./GateAside";
import { RequestPreview } from "./RequestPreview";
import { loginSchema, type LoginValues } from "./schemas";
import { useLogin } from "./useSession";

/** Only same-site relative paths are allowed as a post-login destination. */
function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/map";
}

export function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const login = useLogin();
  const slow = useSlowPending(login.isPending);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });
  const values = useWatch({ control: form.control });
  const { errors, touchedFields } = form.formState;

  const onSubmit = form.handleSubmit(async (data) => {
    setFormError(null);
    try {
      const { user } = await login.mutateAsync(data);
      // First visit on this browser: show the orientation before the map
      router.push(useLearningStore.getState().onboarded[user.id] ? next : "/welcome");
    } catch (err) {
      setFormError(mapAuthError(err)[0]?.message ?? "Something went wrong.");
    }
  });

  const ok = (k: keyof LoginValues) => loginSchema.shape[k].safeParse(values[k] ?? "").success;
  const outcome = login.isPending
    ? "sending"
    : login.isSuccess
      ? "pass"
      : formError
        ? "bounce"
        : "idle";

  return (
    <AuthShell
      title="Back on shift"
      tagline={
        <>
          The city kept your lights on. <span className="sign-text">Welcome back.</span>
        </>
      }
      subtitle="Log in and pick up where the city left off."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="text-cyan underline">
            Get your city badge
          </Link>
        </>
      }
      aside={
        <GateAside
          mood={outcome === "pass" ? "happy" : outcome === "bounce" ? "worried" : "idle"}
          line={
            outcome === "bounce" ? "Those credentials don't open this gate." : "Show me your badge."
          }
        >
          <RequestPreview
            method="POST"
            path="/auth/login"
            outcome={outcome}
            fields={(["email", "password"] as const).map((name) => ({
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
          placeholder="Your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...form.register("password")}
        />
        {formError ? <FormAlert>{formError}</FormAlert> : null}
        {slow ? (
          <FormAlert tone="info">
            Waking up the server… this is literally what a cold start is.
          </FormAlert>
        ) : null}
        <Button type="submit" size="lg" loading={login.isPending} className="mt-2 w-full">
          Log in <ArrowRight aria-hidden className="size-4" />
        </Button>
      </form>
    </AuthShell>
  );
}
