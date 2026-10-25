"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VerifyActions() {
  const router = useRouter();
  const [pending, setPending] = useState<"pass" | "skip" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: "verify_pass" | "verify_skip") {
    setPending(action === "verify_pass" ? "pass" : "skip");
    setError(null);
    try {
      const res = await fetch("/api/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "İşlem başarısız");
        setPending(null);
        return;
      }
      router.push("/placement/result");
    } catch {
      setError("Bağlantı hatası");
      setPending(null);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      <button
        type="button"
        disabled={pending !== null}
        onClick={() => run("verify_pass")}
        className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
      >
        {pending === "pass" ? "Kaydediliyor…" : "Doğrulamayı geç (mock)"}
      </button>
      <button
        type="button"
        disabled={pending !== null}
        onClick={() => run("verify_skip")}
        className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-medium hover:bg-brand-soft disabled:opacity-60"
      >
        {pending === "skip" ? "Kaydediliyor…" : "Atla (bir seviye düşebilir)"}
      </button>
      <p className="text-xs text-muted">
        Gerçek kayıt / dinleme Dilim E’de. Bu adım yalnızca A2/B1 adayları için mock
        doğrulama kabuğudur.
      </p>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
