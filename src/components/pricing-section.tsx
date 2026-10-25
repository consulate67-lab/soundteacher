import Link from "next/link";
import { LESSONS_PER_MONTH, PAID_PLANS } from "@/lib/plans";

export function PricingSection({
  ctaHref = "/signup",
}: {
  ctaHref?: string;
}) {
  return (
    <section
      id="abonelik"
      className="relative border-t border-border/60 bg-[color-mix(in_oklab,var(--background)_88%,white)] px-6 py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-4xl">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
          Abonelik ücretleri
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-medium text-foreground sm:text-4xl">
          8 ders / ay
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Dinleme geri bildirimli Path. İstediğin dönemde başla — deneme ücretsiz.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {PAID_PLANS.map((plan) => (
            <li key={plan.id} className="st-panel relative flex flex-col px-5 py-5">
              {plan.badge ? (
                <span className="absolute right-4 top-4 rounded-md bg-brand-soft px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-brand">
                  {plan.badge}
                </span>
              ) : null}
              <p className="font-[family-name:var(--font-display)] text-xl font-medium text-foreground">
                {plan.name}
              </p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-brand">
                {plan.priceLabel}
              </p>
              <p className="mt-2 text-sm text-foreground">
                <strong>{plan.lessonCount} ders</strong>
                <span className="text-muted"> · {plan.period}</span>
              </p>
              <p className="mt-1 text-xs text-muted">{plan.blurb}</p>
              <Link
                href={ctaHref}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                {ctaHref.includes("plans") ? "Planı seç" : "Kayıt ol"}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-xs text-muted">
          Cadence: {LESSONS_PER_MONTH} ders / ay · Fiyatlar KDV dahil gösterilir (MVP)
        </p>
      </div>
    </section>
  );
}
