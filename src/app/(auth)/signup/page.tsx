import type { Metadata } from "next";

import { SignupForm } from "@/features/auth/SignupForm";
import { RedirectIfSignedIn } from "@/features/session/RedirectIfSignedIn";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <>
      <RedirectIfSignedIn />
      <SignupForm />
    </>
  );
}
