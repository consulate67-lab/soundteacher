"use client";

import { useMemo, useState } from "react";
import { Method1Recorder } from "@/components/method1-recorder";
import { Method2Recorder } from "@/components/method2-recorder";
import { TeacherBubble } from "@/components/teacher-bubble";
import type { Band } from "@/lib/bands";
import type { ListeningMethod } from "@/lib/lesson-content-types";
import { quotaExhaustedBubble } from "@/lib/feedback-copy";
import type { QuotaSnapshot } from "@/lib/quota";
import { Y1_MAX_SECONDS, Y2_MAX_SECONDS } from "@/lib/quota";

type Props = {
  lessonId: string;
  band: Band;
  prepText: string;
  recommendedMethod: ListeningMethod;
  allowedMethods: ListeningMethod[];
  quota: QuotaSnapshot;
};

type Stage = "pick" | "y1" | "y2" | "s22";

/**
 * S32 handoff + Dilim F method choice / S22 kota.
 */
export function ListeningHandoff({
  lessonId,
  band,
  prepText,
  recommendedMethod,
  allowedMethods,
  quota,
}: Props) {
  const initial = useMemo(() => {
    const can2 = allowedMethods.includes("2") && quota.method2Available;
    const can1 = allowedMethods.includes("1") && quota.method1Available;
    if (recommendedMethod === "2" && can2) return "pick" as Stage;
    if (allowedMethods.length > 1 && (can1 || can2)) return "pick" as Stage;
    if (can1) return "y1" as Stage;
    if (can2) return "y2" as Stage;
    return "s22" as Stage;
  }, [allowedMethods, recommendedMethod, quota]);

  const [stage, setStage] = useState<Stage>(initial);

  function choose(method: ListeningMethod) {
    if (method === "2") {
      if (!quota.method2Available) {
        setStage("s22");
        return;
      }
      setStage("y2");
      return;
    }
    if (!quota.method1Available) {
      setStage("s22");
      return;
    }
    setStage("y1");
  }

  if (stage === "s22") {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-medium">
          Kota dolu
        </h2>
        <TeacherBubble text={quotaExhaustedBubble(band)} band={band} />
        <p className="text-sm text-muted">
          Yöntem 2: {quota.method2Used}/{quota.method2Limit} · Yöntem 1:{" "}
          {quota.method1Used}/{quota.method1Limit}. Ders açık kalır — yalnızca dinleme
          yolu kısıtlı.
        </p>
        {quota.method1Available && allowedMethods.includes("1") ? (
          <button
            type="button"
            onClick={() => setStage("y1")}
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Ortam kaydına geç (Yöntem 1)
          </button>
        ) : (
          <p className="text-sm text-muted">
            Her iki kota da dolu. Limit yenilenince tekrar dene.
          </p>
        )}
        <button
          type="button"
          onClick={() => setStage("pick")}
          className="text-sm text-muted hover:text-foreground"
        >
          Sonra dene / seçime dön
        </button>
      </section>
    );
  }

  if (stage === "y1") {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-medium">
          Dinleme — Yöntem 1
        </h2>
        <Method1Recorder
          lessonId={lessonId}
          band={band}
          prepText={prepText}
          maxSeconds={Y1_MAX_SECONDS}
        />
        {allowedMethods.length > 1 ? (
          <button
            type="button"
            onClick={() => setStage("pick")}
            className="text-sm text-muted hover:text-foreground"
          >
            Yöntem seçimine dön
          </button>
        ) : null}
      </section>
    );
  }

  if (stage === "y2") {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-medium">
          Dinleme — Yöntem 2
        </h2>
        <Method2Recorder
          lessonId={lessonId}
          band={band}
          prepText={prepText}
          maxSeconds={Y2_MAX_SECONDS}
          onBackToPicker={allowedMethods.length > 1 ? () => setStage("pick") : undefined}
        />
      </section>
    );
  }

  // pick
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-medium">
        Dinleme handoff
      </h2>
      <TeacherBubble
        text={
          band === "adult"
            ? "Kayda hazır mısınız? … [kısa durak] Yöntemi seçin."
            : "Kayda hazır mısın? … [kısa durak] Yöntemi seç."
        }
        band={band}
      />
      <p className="text-sm text-muted">{prepText}</p>
      <p className="text-xs text-muted">
        Öneri: {recommendedMethod === "1" ? "Ortam kaydı (1)" : "Performans kaydı (2)"}
      </p>

      <ul className="flex flex-col gap-2">
        {allowedMethods.includes("1") ? (
          <li>
            <button
              type="button"
              onClick={() => choose("1")}
              disabled={!quota.method1Available}
              className="w-full rounded-md border border-border bg-surface px-4 py-3 text-left text-sm hover:bg-brand-soft disabled:opacity-50"
            >
              <span className="font-semibold">Ortam kaydı (Yöntem 1)</span>
              <span className="mt-1 block text-xs text-muted">
                Kısa · kota {quota.method1Remaining}/{quota.method1Limit} kaldı
              </span>
            </button>
          </li>
        ) : null}
        {allowedMethods.includes("2") ? (
          <li>
            <button
              type="button"
              onClick={() => choose("2")}
              disabled={!quota.method2Available}
              className="w-full rounded-md border border-border bg-surface px-4 py-3 text-left text-sm hover:bg-brand-soft disabled:opacity-50"
            >
              <span className="font-semibold">Performans kaydı (Yöntem 2)</span>
              <span className="mt-1 block text-xs text-muted">
                Uzun · bitiş raporu · kota {quota.method2Remaining}/{quota.method2Limit}{" "}
                kaldı
                {!quota.method2Available ? " · dolu" : ""}
              </span>
            </button>
          </li>
        ) : null}
      </ul>

      {!quota.method2Available && allowedMethods.includes("2") ? (
        <button
          type="button"
          onClick={() => setStage("s22")}
          className="text-left text-sm text-brand hover:underline"
        >
          Kota dolu — ne yapabilirim? (S22)
        </button>
      ) : null}
    </section>
  );
}
