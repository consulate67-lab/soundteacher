"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BAND_LABELS, type Band } from "@/lib/bands";

const OPTIONS: Band[] = ["child", "teen", "adult"];

export function BandForm() {
  const router = useRouter();
  const [band, setBand] = useState<Band | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function continueNext() {
    if (!band) {
      setError("Bir yaş bandı seç.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/placement", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_band", band }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Kayıt başarısız");
        setPending(false);
        return;
      }
      router.push(`/placement/skills?band=${band}`);
    } catch {
      setError("Bağlantı hatası");
      setPending(false);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      {OPTIONS.map((id) => {
        const active = band === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setBand(id)}
            className={`rounded-md border px-4 py-4 text-left text-base font-medium transition-colors ${
              active
                ? "border-brand bg-brand-soft text-foreground"
                : "border-border bg-surface text-foreground hover:bg-brand-soft/50"
            } ${id === "child" ? "min-h-14 text-lg" : ""}`}
          >
            {BAND_LABELS[id]}
          </button>
        );
      })}

      <button
        type="button"
        onClick={continueNext}
        disabled={pending}
        className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : "Devam"}
      </button>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
