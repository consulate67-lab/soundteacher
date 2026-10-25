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

/**
 * S35 — one primary correction spoken; full ordered list visible (esp. Y2 end report).
 * Order: pitch errors first, then timing (product preference).
 */
export function ListeningFeedback({ attempt, band, lessonId }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bubbles = feedbackBubblesForAttempt(attempt, band);
  const ordered = orderErrors(attempt.errorSpans);
  const primary = primaryError(ordered);
  const rest = ordered.filter((e) => e !== primary);
  const isY2 = attempt.method === "2";

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
        {isY2 ? "Performans raporu" : "Geri bildirim"}
      </h2>

      {isY2 && attempt.scoreSummary ? (
        <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm">
          Skor bandı: <strong>{scoreLabel(attempt.scoreSummary.bandLabel, band)}</strong>
          {" · "}
          {attempt.scoreSummary.notesDetected} nota algısı (stub)
        </p>
      ) : null}

      {bubbles.map((text, i) => (
        <TeacherBubble key={i} text={text} />
      ))}

      {primary ? (
        <div className="rounded-md border border-brand bg-brand-soft px-3 py-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            Bu turda düzelt (tek)
          </p>
          <p className="mt-1 font-medium">{formatSpan(primary, band)}</p>
        </div>
      ) : (
        <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted">
          Bu turda yüksek öncelikli hata yok.
        </p>
      )}

      {rest.length > 0 ? (
        <ol className="list-decimal space-y-1 pl-5 text-xs text-muted">
          <li className="list-none font-medium text-foreground/70 -ml-5">
            Sıralı hata listesi (ekran)
          </li>
          {rest.map((e, i) => (
            <li key={i}>{formatSpan(e, band)}</li>
          ))}
        </ol>
      ) : null}

      <p className="text-xs text-muted">
        Attempt {attempt.id.slice(0, 12)}… · {attempt.durationMs} ms · yöntem{" "}
        {attempt.method}
        {attempt.quotaConsumed ? " · kota −1" : " · kota yok"}
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

function orderErrors(spans: ErrorSpan[]): ErrorSpan[] {
  return [...spans].sort((a, b) => {
    if (a.type !== b.type) return a.type === "pitch" ? -1 : 1;
    if (a.severity !== b.severity) return a.severity === "high" ? -1 : 1;
    return a.measure - b.measure;
  });
}

function scoreLabel(label: "pass" | "soft" | "fail", band: Band): string {
  if (band === "child") {
    if (label === "pass") return "Güzel";
    if (label === "soft") return "Neredeyse";
    return "Bir tur daha";
  }
  if (band === "teen") {
    if (label === "pass") return "Geçti";
    if (label === "soft") return "İyi / küçük düzeltme";
    return "Eşik altı";
  }
  if (label === "pass") return "Geçer";
  if (label === "soft") return "Kabul / ince ayar";
  return "Eşik tutmadı";
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
