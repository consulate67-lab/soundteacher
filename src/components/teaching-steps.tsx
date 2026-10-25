"use client";

import { useState } from "react";
import { StepDemoPlayer } from "@/components/step-demo-player";
import type { Band } from "@/lib/bands";
import type { TeachingStep } from "@/lib/lesson-content-types";
import { pickBand } from "@/lib/lesson-content";

type Props = {
  title: string;
  steps: TeachingStep[];
  band: Band;
};

/**
 * Theory/practice steps: each beat shows its real-hand demo (if mapped)
 * with the TR coaching text — finger landing targets via captioned footage.
 */
export function TeachingSteps({ title, steps, band }: Props) {
  const withDemo = steps.some((s) => s.demo);
  const [active, setActive] = useState(0);
  const current = steps[active] ?? steps[0];

  if (!withDemo) {
    return (
      <div className="st-panel px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">
          {title}
        </p>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          {steps.map((step, i) => (
            <li key={i}>{pickBand(step, band)}</li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">
        {title} · el demosu
      </p>

      {current?.demo ? (
        <StepDemoPlayer demoId={current.demo} />
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-border text-sm text-muted">
          Bu adım için demo yakında
        </div>
      )}

      <p className="font-[family-name:var(--font-display)] text-base font-medium leading-snug text-foreground">
        <span className="mr-2 text-accent">{active + 1}.</span>
        {current ? pickBand(current, band) : null}
      </p>

      <ol className="flex flex-col gap-1.5">
        {steps.map((step, i) => {
          const on = i === active;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                  on
                    ? "border-brand bg-brand-soft text-foreground"
                    : "border-border bg-surface text-muted hover:bg-brand-soft/50"
                }`}
              >
                <span className="font-semibold text-brand">{i + 1}.</span>{" "}
                {pickBand(step, band)}
                {step.demo ? (
                  <span className="ml-2 text-[0.65rem] uppercase tracking-wide text-accent">
                    video
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
