"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TeacherBubble } from "@/components/teacher-bubble";
import type { Band } from "@/lib/bands";
import type { AttemptRecord, InvalidReason } from "@/lib/attempt";
import { invalidBubble, performanceIntroBubble } from "@/lib/feedback-copy";
import { Y2_ABANDON_MS, Y2_MAX_SECONDS } from "@/lib/quota";
import {
  completeListeningAction,
  registerInvalidAttemptAction,
} from "@/app/lessons/[lessonId]/actions";

type MicUi =
  | "ready"
  | "permission"
  | "denied"
  | "countdown"
  | "recording" // S34
  | "uploading"
  | "invalid"
  | "abandoned"; // S45

type Props = {
  lessonId: string;
  band: Band;
  prepText: string;
  maxSeconds?: number;
  onBackToPicker?: () => void;
};

const COUNTDOWN_FROM = 3;

/** S34 — longer live-mic performance; analyze only at end; AI silent while recording. */
export function Method2Recorder({
  lessonId,
  band,
  prepText,
  maxSeconds = Y2_MAX_SECONDS,
  onBackToPicker,
}: Props) {
  const router = useRouter();
  const [ui, setUi] = useState<MicUi>("ready");
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [invalidReason, setInvalidReason] = useState<InvalidReason | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopModeRef = useRef<"finish" | "abandon">("finish");

  const cleanupStream = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    recorderRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
  }, []);

  useEffect(() => () => cleanupStream(), [cleanupStream]);

  async function requestMic() {
    setError(null);
    setUi("permission");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setUi("countdown");
      setCountdown(COUNTDOWN_FROM);
    } catch {
      setUi("denied");
    }
  }

  useEffect(() => {
    if (ui !== "countdown") return;
    if (countdown <= 0) {
      void startRecording();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui, countdown]);

  async function startRecording() {
    const stream = mediaStreamRef.current;
    if (!stream) {
      setUi("denied");
      return;
    }

    chunksRef.current = [];
    stopModeRef.current = "finish";
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType: mime });
    } catch {
      recorder = new MediaRecorder(stream);
    }

    recorderRef.current = recorder;
    recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) chunksRef.current.push(ev.data);
    };
    recorder.onstop = () => {
      void onStopped();
    };

    startedAtRef.current = Date.now();
    setElapsed(0);
    setUi("recording");
    recorder.start(250);

    timerRef.current = setInterval(() => {
      const ms = Date.now() - startedAtRef.current;
      setElapsed(ms);
      if (ms >= maxSeconds * 1000) {
        stopRecording("finish");
      }
    }, 200);
  }

  function stopRecording(mode: "finish" | "abandon") {
    stopModeRef.current = mode;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }

  async function onStopped() {
    setUi("uploading");
    const durationMs = Date.now() - startedAtRef.current;
    const abandon = stopModeRef.current === "abandon" || durationMs < Y2_ABANDON_MS;

    const blob = new Blob(chunksRef.current, {
      type: recorderRef.current?.mimeType || "audio/webm",
    });
    cleanupStream();

    try {
      const form = new FormData();
      form.set("lessonId", lessonId);
      form.set("method", "2");
      form.set("durationMs", String(durationMs));
      if (abandon) form.set("abandoned", "true");
      if (!abandon) form.set("audio", blob, "performance.webm");

      const res = await fetch("/api/listening/analyze", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as {
        error?: string;
        code?: string;
        attempt?: AttemptRecord;
        abandoned?: boolean;
      };

      if (res.status === 429) {
        setError("Yöntem 2 kotası doldu. Ortam kaydına geç.");
        setUi("ready");
        return;
      }

      if (!res.ok || !data.attempt) {
        setError(data.error ?? "Analiz başarısız");
        setUi("ready");
        return;
      }

      const attempt = data.attempt;

      if (attempt.invalidReason === "abandoned" || data.abandoned) {
        await registerInvalidAttemptAction(lessonId, attempt.id);
        setUi("abandoned");
        router.refresh();
        return;
      }

      if (!attempt.valid) {
        setInvalidReason(attempt.invalidReason);
        await registerInvalidAttemptAction(lessonId, attempt.id);
        setUi("invalid");
        router.refresh();
        return;
      }

      await completeListeningAction(lessonId, attempt.id);
      router.refresh();
    } catch {
      setError("Yükleme hatası. Tekrar dene.");
      setUi("ready");
    }
  }

  const elapsedSec = Math.floor(elapsed / 1000);

  return (
    <div className="flex flex-col gap-4">
      {ui === "ready" || ui === "permission" ? (
        <>
          <TeacherBubble text={performanceIntroBubble(band)} />
          <p className="text-sm text-muted">{prepText}</p>
          <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm">
            Yöntem 2 · performans · en fazla ~{maxSeconds} sn · bitişte rapor
          </p>
          <button
            type="button"
            onClick={requestMic}
            disabled={ui === "permission"}
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
          >
            {ui === "permission" ? "İzin isteniyor…" : "Hazırım — kayda başla"}
          </button>
          {onBackToPicker ? (
            <button
              type="button"
              onClick={onBackToPicker}
              className="text-sm text-muted hover:text-foreground"
            >
              Yöntem seçimine dön
            </button>
          ) : null}
        </>
      ) : null}

      {ui === "denied" ? (
        <section className="flex flex-col gap-3">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-medium">
            Mikrofon reddedildi
          </h3>
          <TeacherBubble text={invalidBubble("denied_mic", band)} />
          <button
            type="button"
            onClick={requestMic}
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Tekrar dene
          </button>
        </section>
      ) : null}

      {ui === "countdown" ? (
        <section className="flex flex-col items-center gap-3 py-8">
          <p className="text-sm text-muted">Performans başlıyor…</p>
          <p className="font-[family-name:var(--font-display)] text-5xl font-semibold text-brand">
            {countdown}
          </p>
          <p className="text-xs text-muted">AI susacak. Canlı hata yok.</p>
        </section>
      ) : null}

      {ui === "recording" ? (
        <section className="flex flex-col gap-4">
          <p className="text-sm font-medium">Kayıt sürüyor</p>
          <p className="font-[family-name:var(--font-display)] text-3xl tabular-nums text-brand">
            {elapsedSec}s
          </p>
          <p className="text-xs text-muted">
            Minimal UI · hata listesi yok · AI sus · Devam et…
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => stopRecording("finish")}
              className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Bitir
            </button>
            <button
              type="button"
              onClick={() => stopRecording("abandon")}
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-medium hover:bg-brand-soft"
            >
              Yarıda bırak
            </button>
          </div>
          <p className="text-xs text-muted">
            {Math.ceil(Y2_ABANDON_MS / 1000)} sn’den kısa bırakmalar kota yakmaz (S45).
          </p>
        </section>
      ) : null}

      {ui === "uploading" ? (
        <p className="text-sm text-muted">Bitiş analizi… (stub)</p>
      ) : null}

      {ui === "abandoned" ? (
        <section className="flex flex-col gap-3">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-medium">
            Yarıda bırakıldı
          </h3>
          <TeacherBubble text={invalidBubble("abandoned", band)} />
          <p className="text-sm text-muted">
            Kapı yazılmadı · kota düşmedi. Yeniden başlayabilirsin.
          </p>
          <button
            type="button"
            onClick={() => setUi("ready")}
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Yeniden başla
          </button>
        </section>
      ) : null}

      {ui === "invalid" && invalidReason ? (
        <section className="flex flex-col gap-3">
          <TeacherBubble text={invalidBubble(invalidReason, band)} />
          <button
            type="button"
            onClick={() => {
              setInvalidReason(null);
              setUi("ready");
            }}
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Yeniden kaydet
          </button>
        </section>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
