"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Band } from "@/lib/bands";
import { questionsForBand, type AnswerMap } from "@/lib/placement";

export function SkillsForm({ band }: { band: Band }) {
  const router = useRouter();
  const questions = useMemo(() => questionsForBand(band), [band]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const current = questions[index];
  const selected = answers[current.id];
  const isLast = index === questions.length - 1;

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
      };
      if (!res.ok) {
        setError(data.error ?? "Skorlanamadı");
        setPending(false);
        return;
      }
      if (data.needsVerification) {
        router.push("/placement/verify");
      } else {
        router.push("/placement/result");
      }
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
      <h2 className="font-[family-name:var(--font-display)] text-xl font-medium text-foreground">
        {current.prompt}
      </h2>

      <ul className="flex flex-col gap-2">
        {current.options.map((opt) => {
          const active = selected === opt.id;
          return (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => pick(opt.id)}
                className={`w-full rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  band === "child" ? "min-h-12 text-base" : ""
                } ${
                  active
                    ? "border-brand bg-brand-soft"
                    : "border-border bg-surface hover:bg-brand-soft/50"
                }`}
              >
                {opt.label}
              </button>
            </li>
          );
        })}
      </ul>

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
