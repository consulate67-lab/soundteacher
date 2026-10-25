"use client";

import { useEffect, useState } from "react";
import type { Band } from "@/lib/bands";
import {
  cancelSpeech,
  rateForBand,
  speakTeacherText,
  speechSupported,
} from "@/lib/tts-client";

/**
 * Teacher AI bubble — pause styling + optional Web Speech TTS (Dilim H).
 * Graceful fallback: text always visible; speak only when supported / unmuted.
 */

type Props = {
  text: string;
  className?: string;
  /** Band rate for Web Speech (child slower). Dinle button always available. */
  band?: Band;
  /** Speak once on mount — use sparingly (one bubble per view). */
  autoSpeak?: boolean;
};

export function TeacherBubble({ text, className = "", band, autoSpeak = false }: Props) {
  const parts = tokenize(text);
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(speechSupported());
  }, []);

  useEffect(() => {
    if (!autoSpeak) return;
    if (!speechSupported()) return;
    setSpeaking(true);
    speakTeacherText(text, {
      rate: rateForBand(band ?? "adult"),
      onEnd: () => setSpeaking(false),
    });
    return () => {
      cancelSpeech();
      setSpeaking(false);
    };
  }, [text, band, autoSpeak]);

  function toggleSpeak() {
    if (!supported) return;
    if (speaking) {
      cancelSpeech();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speakTeacherText(text, {
      rate: rateForBand(band ?? "adult"),
      onEnd: () => setSpeaking(false),
    });
  }

  return (
    <div
      className={`rounded-md border border-brand/30 bg-brand-soft/80 px-4 py-3 text-sm leading-relaxed text-foreground ${className}`}
      role="status"
      aria-label="Öğretmen"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-brand">
          Öğretmen
        </p>
        {supported ? (
          <button
            type="button"
            onClick={toggleSpeak}
            className="text-[0.65rem] font-medium text-brand underline-offset-2 hover:underline"
            aria-pressed={speaking}
          >
            {speaking ? "Durdur" : "Dinle"}
          </button>
        ) : (
          <span className="text-[0.65rem] text-muted" title="Web Speech yok">
            Metin
          </span>
        )}
      </div>
      <p>
        {parts.map((part, i) => {
          if (part.type === "pause") {
            return (
              <span
                key={i}
                className="mx-0.5 inline-block animate-pulse text-muted"
                title={part.raw}
              >
                …
              </span>
            );
          }
          return <span key={i}>{part.value}</span>;
        })}
      </p>
    </div>
  );
}

type Token = { type: "text"; value: string } | { type: "pause"; raw: string };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const re = /(\[nefes\]|\[kısa durak\]|\.\.\.|…)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(input)) !== null) {
    if (match.index > last) {
      tokens.push({ type: "text", value: input.slice(last, match.index) });
    }
    tokens.push({ type: "pause", raw: match[0] });
    last = match.index + match[0].length;
  }
  if (last < input.length) {
    tokens.push({ type: "text", value: input.slice(last) });
  }
  return tokens;
}
