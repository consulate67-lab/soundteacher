"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TeacherBubble } from "@/components/teacher-bubble";
import type { Band } from "@/lib/bands";
import type { AttemptRecord, InvalidReason } from "@/lib/attempt";
import {
  completeListeningAction,
  registerInvalidAttemptAction,
} from "@/app/lessons/[lessonId]/actions";
import {
  midiIntroBubble,
  midiUnsupportedBubble,
  invalidBubble,
} from "@/lib/feedback-copy";
import type { MidiNoteEvent } from "@/lib/midi/types";
import { midiNoteLabel } from "@/lib/midi/note-names";
import { Y3_MAX_SECONDS } from "@/lib/quota";

type MicUi =
  | "unsupported"
  | "connect"
  | "ready"
  | "countdown"
  | "recording"
  | "uploading"
  | "invalid";

type Props = {
  lessonId: string;
  band: Band;
  prepText: string;
  maxSeconds?: number;
  onFallbackMic?: () => void;
};

const COUNTDOWN_FROM = 3;

function webMidiSupported(): boolean {
  return typeof navigator !== "undefined" && "requestMIDIAccess" in navigator;
}

export function Method3Recorder({
  lessonId,
  band,
  prepText,
  maxSeconds = Y3_MAX_SECONDS,
  onFallbackMic,
}: Props) {
  const router = useRouter();
  const [ui, setUi] = useState<MicUi>(() =>
    webMidiSupported() ? "connect" : "unsupported",
  );
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [invalidReason, setInvalidReason] = useState<InvalidReason | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [lastNote, setLastNote] = useState<string | null>(null);
  const [noteCount, setNoteCount] = useState(0);

  const accessRef = useRef<MIDIAccess | null>(null);
  const eventsRef = useRef<MidiNoteEvent[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingRef = useRef(false);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    recordingRef.current = false;
    const access = accessRef.current;
    if (access) {
      for (const input of access.inputs.values()) {
        input.onmidimessage = null;
      }
    }
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  async function connectMidi() {
    setError(null);
    if (!webMidiSupported()) {
      setUi("unsupported");
      return;
    }
    try {
      const access = await navigator.requestMIDIAccess({ sysex: false });
      accessRef.current = access;
      const inputs = [...access.inputs.values()];
      if (inputs.length === 0) {
        setError("MIDI klavye bulunamadı. USB ile bağlayıp tekrar dene.");
        setUi("connect");
        return;
      }
      const primary = inputs[0]!;
      setDeviceName(primary.name || "MIDI klavye");
      setUi("ready");
    } catch {
      setError("MIDI izni reddedildi veya erişim başarısız.");
      setUi("connect");
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

  function onMidiMessage(ev: MIDIMessageEvent) {
    if (!recordingRef.current) return;
    const data = ev.data;
    if (!data || data.length < 2) return;
    const status = data[0]! & 0xf0;
    const note = data[1]!;
    const velocity = data.length > 2 ? data[2]! : 0;
    const t = Date.now() - startedAtRef.current;

    if (status === 0x90 && velocity > 0) {
      eventsRef.current.push({ t, type: "on", note, velocity });
      setLastNote(midiNoteLabel(note));
      setNoteCount((n) => n + 1);
    } else if (status === 0x80 || (status === 0x90 && velocity === 0)) {
      eventsRef.current.push({ t, type: "off", note, velocity: 0 });
    }
  }

  function startRecording() {
    const access = accessRef.current;
    if (!access) {
      setUi("connect");
      return;
    }
    eventsRef.current = [];
    setNoteCount(0);
    setLastNote(null);
    startedAtRef.current = Date.now();
    recordingRef.current = true;
    setElapsed(0);
    setUi("recording");

    for (const input of access.inputs.values()) {
      input.onmidimessage = onMidiMessage;
    }

    timerRef.current = setInterval(() => {
      const ms = Date.now() - startedAtRef.current;
      setElapsed(ms);
      if (ms >= maxSeconds * 1000) {
        void stopRecording();
      }
    }, 100);
  }

  async function stopRecording() {
    if (!recordingRef.current && ui !== "recording") return;
    recordingRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const access = accessRef.current;
    if (access) {
      for (const input of access.inputs.values()) {
        input.onmidimessage = null;
      }
    }

    setUi("uploading");
    setError(null);
    const durationMs = Date.now() - startedAtRef.current;
    const events = eventsRef.current.slice();

    if (events.filter((e) => e.type === "on").length < 2) {
      setInvalidReason("silence");
      setUi("invalid");
      return;
    }

    try {
      const res = await fetch("/api/listening/analyze-midi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          durationMs,
          events,
          deviceName: deviceName ?? undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        attempt?: AttemptRecord;
      };
      if (!res.ok || !data.attempt) {
        setError(data.error ?? "MIDI analiz başarısız");
        setUi("ready");
        return;
      }

      const attempt = data.attempt;
      if (!attempt.valid) {
        setInvalidReason(attempt.invalidReason);
        const reg = await registerInvalidAttemptAction(lessonId, attempt);
        if (reg && "error" in reg && reg.error) setError(reg.error);
        setUi("invalid");
        router.refresh();
        return;
      }

      const done = await completeListeningAction(lessonId, attempt);
      if (done && "error" in done && done.error) {
        setError(done.error);
        setUi("ready");
        return;
      }
      router.refresh();
    } catch {
      setError("Bağlantı hatası. Tekrar dene.");
      setUi("ready");
    }
  }

  const elapsedSec = Math.floor(elapsed / 1000);

  return (
    <div className="flex flex-col gap-4">
      {ui === "unsupported" ? (
        <section className="flex flex-col gap-3">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-medium">
            MIDI desteklenmiyor
          </h3>
          <TeacherBubble text={midiUnsupportedBubble(band)} band={band} />
          <p className="text-sm text-muted">
            Chrome veya Edge + USB MIDI klavye önerilir. Bu derste Yöntem 1 / 2 ile
            devam edebilirsin.
          </p>
          {onFallbackMic ? (
            <button
              type="button"
              onClick={onFallbackMic}
              className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Ortam kaydına geç (Yöntem 1)
            </button>
          ) : null}
        </section>
      ) : null}

      {ui === "connect" ? (
        <>
          <TeacherBubble text={midiIntroBubble(band)} band={band} />
          <p className="text-sm text-muted">{prepText}</p>
          <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm">
            Yöntem 3 · <strong>USB / MIDI klavye</strong> · mikrofon yok
          </p>
          <button
            type="button"
            onClick={connectMidi}
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            MIDI klavyeyi bağla
          </button>
          {onFallbackMic ? (
            <button
              type="button"
              onClick={onFallbackMic}
              className="text-sm text-muted hover:text-foreground"
            >
              MIDI yok — ortam kaydına geç
            </button>
          ) : null}
        </>
      ) : null}

      {ui === "ready" ? (
        <>
          <TeacherBubble text={midiIntroBubble(band)} band={band} />
          <p className="rounded-md border border-brand bg-brand-soft px-3 py-2 text-sm">
            Bağlı: <strong>{deviceName ?? "MIDI"}</strong>
          </p>
          <p className="text-sm text-muted">
            Kısa pratik (~{maxSeconds} sn). Nota-on/off kaydı; AI susacak.
          </p>
          <button
            type="button"
            onClick={() => {
              setCountdown(COUNTDOWN_FROM);
              setUi("countdown");
            }}
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Kayda başla
          </button>
        </>
      ) : null}

      {ui === "countdown" ? (
        <section className="flex flex-col items-center gap-3 py-8">
          <p className="text-sm text-muted">Başlıyor…</p>
          <p className="font-[family-name:var(--font-display)] text-5xl font-semibold text-brand">
            {countdown}
          </p>
          <p className="text-xs text-muted">Klavyeden çal — mic yok</p>
        </section>
      ) : null}

      {ui === "recording" ? (
        <section className="flex flex-col gap-4">
          <p className="text-sm font-medium text-foreground">MIDI kayıt sürüyor</p>
          <p className="font-[family-name:var(--font-display)] text-3xl tabular-nums text-brand">
            {elapsedSec}s
          </p>
          <p className="text-sm text-muted">
            Nota: {noteCount}
            {lastNote ? ` · son ${lastNote}` : ""}
          </p>
          <button
            type="button"
            onClick={() => void stopRecording()}
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Bitir
          </button>
        </section>
      ) : null}

      {ui === "uploading" ? (
        <p className="text-sm text-muted">MIDI analiz ediliyor… geri bildirim hazırlanıyor</p>
      ) : null}

      {ui === "invalid" && invalidReason ? (
        <section className="flex flex-col gap-3">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-medium">
            {invalidReason === "silence" ? "Nota duyulmadı" : "Geçersiz deneme"}
          </h3>
          <TeacherBubble text={invalidBubble(invalidReason, band)} band={band} />
          <button
            type="button"
            onClick={() => {
              setInvalidReason(null);
              setUi(deviceName ? "ready" : "connect");
            }}
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Yeniden dene
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
