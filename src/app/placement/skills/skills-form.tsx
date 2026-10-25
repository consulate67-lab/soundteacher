"use client";

import { useMemo, useState } from "react";
import type { Band } from "@/lib/bands";
import { savePathLocal } from "@/lib/path-client";
import { questionsForBand, type AnswerMap } from "@/lib/placement";
import type { PathRecord } from "@/lib/path-store";

export function SkillsForm({ band }: { band: Band }) {
  const questions = useMemo(() => questionsForBand(band), [band]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const current = questions[index];
  const selected = answers[current.id];
  const isLast = index === questions.length - 1;
  const groupName = `placement-${band}-${current.id}`;

  function pick(optionId: string) {
    setAnswers((prev) => ({ ...prev, [current.id]: optionId }));
    setError(null);
  }

  async function goNext() {
    if (!selected) {
      setError("Bir seçenek seç.");
      return;
    }
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }

    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/placement", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", band, answers }),
      });
      const data = (await res.json()) as {
        error?: string;
        needsVerification?: boolean;
        result?: { level: string };
        path?: PathRecord;
      };
      if (!res.ok) {
        setError(data.error ?? "Skorlanamadı");
        setPending(false);
        return;
      }
      if (data.needsVerification) {
        window.location.assign("/placement/verify");
        return;
      }
      if (data.path) {
        savePathLocal(data.path);
      }
      window.location.assign("/trial-program");
    } catch {
      setError("Bağlantı hatası");
      setPending(false);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <p className="text-xs text-muted">
        Soru {index + 1} / {questions.length}
      </p>
      <h2
        id={`q-${current.id}`}
        className="font-[family-name:var(--font-display)] text-xl font-medium text-foreground"
      >
        {current.prompt}
      </h2>

      <fieldset className="flex flex-col gap-2 border-0 p-0" aria-labelledby={`q-${current.id}`}>
        <legend className="sr-only">{current.prompt}</legend>
        {current.options.map((opt) => {
          const active = selected === opt.id;
          const inputId = `${groupName}-${opt.id}`;
          return (
            <label
              key={opt.id}
              htmlFor={inputId}
              data-option-id={opt.id}
              className={`relative z-10 flex w-full min-h-12 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors ${
                band === "child" ? "min-h-14 text-base" : ""
              } ${
                active
                  ? "border-brand bg-brand-soft"
                  : "border-border bg-surface/80 hover:bg-brand-soft/50"
              }`}
            >
              <input
                id={inputId}
                type="radio"
                name={groupName}
                value={opt.id}
                checked={active}
                onChange={() => pick(opt.id)}
                className="h-4 w-4 shrink-0 accent-[var(--brand)]"
              />
              <span>{opt.label}</span>
            </label>
          );
        })}
      </fieldset>

      <div className="mt-2 flex gap-3">
        {index > 0 ? (
          <button
            type="button"
            onClick={() => setIndex((i) => i - 1)}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium"
          >
            Geri
          </button>
        ) : null}
        <button
          type="button"
          onClick={goNext}
          disabled={pending}
          data-action="placement-next"
          className="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
        >
          {pending ? "Hesaplanıyor…" : isLast ? "Bitir" : "Sonraki"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
