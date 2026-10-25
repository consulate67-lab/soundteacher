"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlanOption } from "@/lib/plans";

export function PlanPicker({
  plans,
  mockMode,
}: {
  plans: PlanOption[];
  mockMode: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(plans[1]?.id ?? plans[0]?.id);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function startCheckout() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selected }),
      });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        mode?: string;
      };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Ödeme oturumu oluşturulamadı.");
        setPending(false);
        return;
      }
      router.push(data.url);
    } catch {
      setError("Bağlantı hatası. Tekrar dene.");
      setPending(false);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      {mockMode ? (
        <p className="rounded-md border border-border bg-brand-soft px-3 py-2 text-xs text-foreground">
          Mock ödeme modu — <code className="font-mono">STRIPE_SECRET_KEY</code> yok.
          Checkout gerçek Stripe’a gitmez.
        </p>
      ) : (
        <p className="rounded-md border border-border bg-surface px-3 py-2 text-xs text-muted">
          Stripe test modu — Checkout Session oluşturulacak.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {plans.map((plan) => {
          const active = selected === plan.id;
          return (
            <li key={plan.id}>
              <button
                type="button"
                onClick={() => setSelected(plan.id)}
                className={`w-full rounded-md border px-4 py-4 text-left transition-colors ${
                  active
                    ? "border-brand bg-brand-soft"
                    : "border-border bg-surface hover:bg-brand-soft/50"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-[family-name:var(--font-display)] text-lg font-medium">
                    {plan.name}
                  </span>
                  <span className="text-sm font-semibold text-brand">
                    {plan.priceLabel}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {plan.period}
                  {plan.badge ? ` · ${plan.badge}` : ""}
                </p>
                <p className="mt-2 text-sm text-foreground/80">{plan.blurb}</p>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={startCheckout}
        disabled={pending || !selected}
        className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
      >
        {pending ? "Yönlendiriliyor…" : "Planı seç"}
      </button>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
