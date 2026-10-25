"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TeacherBubble } from "@/components/teacher-bubble";
import type { Band } from "@/lib/bands";
import type { AttemptRecord, InvalidReason } from "@/lib/attempt";
import { invalidBubble } from "@/lib/feedback-copy";
import {
  completeListeningAction,
  registerInvalidAttemptAction,
} from "@/app/lessons/[lessonId]/actions";

type MicUi =
  | "handoff"
  | "permission" // S40
  | "denied" // S41
  | "countdown"
  | "recording" // S33
  | "uploading"
  | "invalid"; // S42–S44

type Props = {
  lessonId: string;
  band: Band;
  prepText: string;
  maxSeconds?: number;
};

const COUNTDOWN_FROM = 3;

export function Method1Recorder({ lessonId, band, prepText, maxSeconds = 12 }: Props) {
  const router = useRouter();
  const [ui, setUi] = useState<MicUi>("handoff");
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [invalidReason, setInvalidReason] = useState<InvalidReason | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    recorder.start(200);

    timerRef.current = setInterval(() => {
      const ms = Date.now() - startedAtRef.current;
      setElapsed(ms);
      if (ms >= maxSeconds * 1000) {
        stopRecording();
      }
    }, 200);
  }

  function stopRecording() {
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
    const blob = new Blob(chunksRef.current, {
      type: recorderRef.current?.mimeType || "audio/webm",
    });
    cleanupStream();

    try {
      const form = new FormData();
      form.set("lessonId", lessonId);
      form.set("method", "1");
      form.set("durationMs", String(durationMs));
      form.set("audio", blob, "take.webm");

      const res = await fetch("/api/listening/analyze", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as {
        error?: string;
        attempt?: AttemptRecord;
      };
      if (!res.ok || !data.attempt) {
        setError(data.error ?? "Analiz başarısız");
        setUi("handoff");
        return;
      }

      const attempt = data.attempt;
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
      setUi("handoff");
    }
  }

  const elapsedSec = Math.floor(elapsed / 1000);

  return (
    <div className="flex flex-col gap-4">
      {ui === "handoff" || ui === "permission" ? (
        <>
          <TeacherBubble
            text={
              band === "adult"
                ? "Kayda hazır mısınız? … [kısa durak] Ben kayıt sırasında susacağım."
                : "Kayda hazır mısın? … [kısa durak] Ben kayıt sırasında susacağım."
            }
          />
          <p className="text-sm text-muted">{prepText}</p>
          <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm">
            Önerilen yöntem: <strong>Ortam kaydı (Yöntem 1)</strong>
          </p>
          {band === "child" ? (
            <p className="text-xs text-muted">
              Bakıcı: mikrofon izni için yardımcı olabilirsiniz.
            </p>
          ) : null}
          <button
            type="button"
            onClick={requestMic}
            disabled={ui === "permission"}
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
          >
            {ui === "permission" ? "İzin isteniyor…" : "İzin ver ve kayda başla"}
          </button>
          <p className="text-xs text-muted">
            Kısa kayıt (≈{maxSeconds} sn). Analiz stub — ücretli API yok.
          </p>
        </>
      ) : null}

      {ui === "denied" ? (
        <section className="flex flex-col gap-3">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-medium">
            Mikrofon reddedildi
          </h3>
          <TeacherBubble text={invalidBubble("denied_mic", band)} />
          <p className="text-sm text-muted">
            Dinleme bekliyor. Tarayıcı ayarlarından mikrofon iznini açıp yeniden dene.
            Kapı bu turda yazılmaz.
          </p>
          <button
            type="button"
            onClick={requestMic}
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Ayarlardan sonra tekrar dene
          </button>
        </section>
      ) : null}

      {ui === "countdown" ? (
        <section className="flex flex-col items-center gap-3 py-8">
          <p className="text-sm text-muted">Başlıyor…</p>
          <p className="font-[family-name:var(--font-display)] text-5xl font-semibold text-brand">
            {countdown}
          </p>
          <p className="text-xs text-muted">AI susacak. Yavaş çal.</p>
        </section>
      ) : null}

      {ui === "recording" ? (
        <section className="flex flex-col gap-4">
          <p className="text-sm font-medium text-foreground">Kayıt sürüyor</p>
          <p className="font-[family-name:var(--font-display)] text-3xl tabular-nums text-brand">
            {elapsedSec}s
          </p>
          <p className="text-xs text-muted">
            Ölçü ilerlemesi sade · canlı hata listesi yok · AI sus
          </p>
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Bitir
          </button>
        </section>
      ) : null}

      {ui === "uploading" ? (
        <p className="text-sm text-muted">Analiz ediliyor… (stub)</p>
      ) : null}

      {ui === "invalid" && invalidReason ? (
        <section className="flex flex-col gap-3">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-medium">
            {invalidTitle(invalidReason)}
          </h3>
          <TeacherBubble text={invalidBubble(invalidReason, band)} />
          <p className="text-sm text-muted">
            Geçersiz deneme — kapı yazılmadı. Yeniden kaydedebilirsin.
          </p>
          <button
            type="button"
            onClick={() => {
              setInvalidReason(null);
              setUi("handoff");
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

function invalidTitle(reason: InvalidReason): string {
  switch (reason) {
    case "silence":
      return "Ses duyulmadı";
    case "noise":
      return "Gürültülü ortam";
    case "too_quiet":
      return "Ses çok düşük";
    case "too_short":
      return "Kayıt çok kısa";
    default:
      return "Geçersiz deneme";
  }
}
