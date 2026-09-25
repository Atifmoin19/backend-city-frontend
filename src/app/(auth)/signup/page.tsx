import type { Metadata } from "next";
import { Suspense } from "react";

import { SignupForm } from "@/features/auth/SignupForm";
import { RedirectIfSignedIn } from "@/features/session/RedirectIfSignedIn";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <>
      <RedirectIfSignedIn />
      <Suspense>
        <SignupForm />
      </Suspense>
    </>
  );
}
