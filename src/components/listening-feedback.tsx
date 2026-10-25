"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TeacherBubble } from "@/components/teacher-bubble";
import type { Band } from "@/lib/bands";
import type { AttemptRecord, ErrorSpan } from "@/lib/attempt";
import { primaryError } from "@/lib/attempt";
import { feedbackBubblesForAttempt } from "@/lib/feedback-copy";
import { evaluateGateAction } from "@/app/lessons/[lessonId]/actions";

type Props = {
  attempt: AttemptRecord;
  band: Band;
  lessonId: string;
};

/** S35 — one primary error at a time; list stays visible. */
export function ListeningFeedback({ attempt, band, lessonId }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bubbles = feedbackBubblesForAttempt(attempt, band);
  const primary = primaryError(attempt.errorSpans);
  const rest = attempt.errorSpans.filter((e) => e !== primary);

  async function goGate() {
    setPending(true);
    setError(null);
    const res = await evaluateGateAction(lessonId);
    if (res && "error" in res && res.error) {
      setError(res.error);
      setPending(false);
      return;
    }
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-medium">
        Geri bildirim
      </h2>

      {bubbles.map((text, i) => (
        <TeacherBubble key={i} text={text} />
      ))}

      {primary ? (
        <div className="rounded-md border border-brand bg-brand-soft px-3 py-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            Bu turda düzelt
          </p>
          <p className="mt-1 font-medium">{formatSpan(primary, band)}</p>
        </div>
      ) : (
        <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted">
          Bu turda yüksek öncelikli hata yok.
        </p>
      )}

      {rest.length > 0 ? (
        <ul className="space-y-1 text-xs text-muted">
          <li className="font-medium text-foreground/70">Diğer notlar (sessiz)</li>
          {rest.map((e, i) => (
            <li key={i}>{formatSpan(e, band)}</li>
          ))}
        </ul>
      ) : null}

      <p className="text-xs text-muted">
        Attempt {attempt.id.slice(0, 12)}… · {attempt.durationMs} ms · yöntem{" "}
        {attempt.method}
      </p>

      <button
        type="button"
        onClick={goGate}
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
      >
        {pending ? "Kapı değerlendiriliyor…" : "Kapıya git"}
      </button>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </section>
  );
}

function formatSpan(span: ErrorSpan, band: Band): string {
  const kind =
    span.type === "pitch"
      ? band === "adult"
        ? "perde"
        : "yanlış tuş / perde"
      : "zamanlama";
  const extra = span.expected && span.heard ? ` (${span.expected} → ${span.heard})` : "";
  return `Ölçü ${span.measure}${span.note ? ` · ${span.note}` : ""} · ${kind}${extra}`;
}
