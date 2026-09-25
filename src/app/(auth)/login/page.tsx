import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/features/auth/LoginForm";
import { RedirectIfSignedIn } from "@/features/session/RedirectIfSignedIn";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <Suspense>
      <RedirectIfSignedIn />
      <LoginForm />
    </Suspense>
  );
}
