"use client";

import { useEffect, useRef } from "react";
import { demoMeta } from "@/lib/lesson-demos";

type Props = {
  demoId: string;
  /** Compact inline vs full-bleed teaching plane */
  variant?: "full" | "inline";
};

/**
 * Real-human overhead hand demo with FluidR3 piano audio when notes are taught.
 * - Unmuted (user gesture via controls / play)
 * - MP4 preferred over WebM for cleaner A/V sync
 * - One take (no loop) so attack/press stay perceptually locked
 */
export function StepDemoPlayer({ demoId, variant = "full" }: Props) {
  const meta = demoMeta(demoId);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    // Reset to start when the teaching step's demo changes — avoid mid-clip resume
    el.pause();
    el.currentTime = 0;
  }, [demoId]);

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
        ref={videoRef}
        key={demoId}
        className="aspect-video w-full object-cover"
        controls
        playsInline
        preload="auto"
        poster={`${meta.base}-poster.jpg`}
      >
        {/* MP4 first: AAC + H.264 keeps note-on aligned; WebM was audio-leading ~7ms */}
        <source src={`${meta.base}.mp4`} type="video/mp4" />
        <source src={`${meta.base}.webm`} type="video/webm" />
      </video>
      <figcaption className="border-t border-border/60 px-3 py-1.5 text-[0.7rem] text-muted">
        {meta.titleTr} · üstten · gerçek eller · ses açık
      </figcaption>
    </figure>
  );
}
