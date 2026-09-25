import Link from "next/link";

import { Byte } from "@/components/characters/Byte";
import { buttonClasses } from "@/components/ui/Button";
import { SignHeading } from "@/components/ui/SignHeading";

export function FinalCall() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-bg-0 px-5 py-24 sm:px-8 lg:py-28">
      <div
        aria-hidden
        data-ambient
        className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgb(62_230_255/0.5),transparent)]"
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
        <Byte size={88} state="happy" />
        <SignHeading className="mt-6 text-[clamp(2rem,5vw,3.6rem)]">
          The city is dark. Your shift starts now.
        </SignHeading>
        <p className="mt-5 max-w-lg text-lg text-text-2">
          Free while in early access. Everything runs in your browser, so the first lesson loads
          before your coffee does.
        </p>
        <Link href="/signup" className={buttonClasses({ size: "lg", className: "mt-9" })}>
          Start your first shift
        </Link>
      </div>
    </section>
  );
}
