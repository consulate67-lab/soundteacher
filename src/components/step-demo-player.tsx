"use client";

import { demoMeta } from "@/lib/lesson-demos";

type Props = {
  demoId: string;
  /** Compact inline vs full-bleed teaching plane */
  variant?: "full" | "inline";
};

/** Real-human hand demo for a teaching step (overhead + piano audio when notes are taught). */
export function StepDemoPlayer({ demoId, variant = "full" }: Props) {
  const meta = demoMeta(demoId);
  if (!meta) return null;

  return (
    <figure
      className={
        variant === "full"
          ? "overflow-hidden rounded-md border border-border bg-[color-mix(in_oklab,var(--brand-ink)_8%,transparent)]"
          : "overflow-hidden rounded-md border border-border/80"
      }
      aria-label={meta.titleTr}
    >
      <video
        className="aspect-video w-full object-cover"
        controls
        playsInline
        loop
        preload="metadata"
        poster={`${meta.base}-poster.jpg`}
      >
        <source src={`${meta.base}.webm`} type="video/webm" />
        <source src={`${meta.base}.mp4`} type="video/mp4" />
      </video>
      <figcaption className="border-t border-border/60 px-3 py-1.5 text-[0.7rem] text-muted">
        {meta.titleTr} · üstten · gerçek eller
      </figcaption>
    </figure>
  );
}
