"use client";

import { Download, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button, buttonClasses } from "@/components/ui/Button";

import { drawShareCard, type ShareCardData } from "./shareCard";

const SITE = "https://backend-city-frontend-two.vercel.app";

/** After a passed checkpoint: a result card to download or share, plus X / LinkedIn links. */
export function ShareResult({ data }: { data: ShareCardData }) {
  const [card, setCard] = useState<{ blob: Blob; url: string } | null>(null);
  const [open, setOpen] = useState(false);
  const text = `I cleared ${data.game} in Full Stack City with ${data.score}% (${data.stars}★), writing real FastAPI code.`;

  useEffect(() => {
    if (!open || card) return;
    let url = "";
    void drawShareCard(data).then((blob) => {
      url = URL.createObjectURL(blob);
      setCard({ blob, url });
    });
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [open, card, data]);

  if (!open) {
    return (
      <Button
        variant="ghost"
        icon={<Share2 aria-hidden className="size-4" />}
        onClick={() => setOpen(true)}
      >
        Share your result
      </Button>
    );
  }
  const file = card
    ? new File([card.blob], "full-stack-city-result.png", { type: "image/png" })
    : null;
  const canShareFile =
    !!file && typeof navigator !== "undefined" && !!navigator.canShare?.({ files: [file] });
  return (
    <div className="mt-2 w-full rounded-lg border border-line bg-bg-1 p-3">
      {card ? (
        // eslint-disable-next-line @next/next/no-img-element -- a local blob URL, not an optimisable asset
        <img
          src={card.url}
          alt={`Result card: ${text}`}
          className="w-full rounded-md border border-line"
        />
      ) : (
        <p className="py-10 text-center text-sm text-text-3">Drawing your card…</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {card ? (
          <a
            href={card.url}
            download="full-stack-city-result.png"
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            <Download aria-hidden className="size-4" /> Download
          </a>
        ) : null}
        {canShareFile ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              void navigator.share({ files: [file], text, url: SITE }).catch(() => undefined)
            }
          >
            <Share2 aria-hidden className="size-4" /> Share
          </Button>
        ) : null}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(SITE)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses({ variant: "ghost", size: "sm" })}
        >
          Post on X
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses({ variant: "ghost", size: "sm" })}
        >
          Post on LinkedIn
        </a>
      </div>
      <p className="mt-2 text-xs text-text-3">
        X and LinkedIn share the link; attach the downloaded card to show your score.
      </p>
    </div>
  );
}
