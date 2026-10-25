import type { Metadata } from "next";
import Link from "next/link";
import { requireSubscribed } from "@/lib/access";
import { getPlan } from "@/lib/plans";
import { statusLabelTr } from "@/lib/subscription";
import { signOutAction, simulatePastDueAction } from "./actions";

export const metadata: Metadata = {
  title: "Path Home",
  description: "SoundTeacher öğrenme yolu (iskelet).",
};

/** Protected Path Home shell — requires trial/active entitlement. */
export default async function HomePage() {
  const { session, subscription } = await requireSubscribed();
  const plan = getPlan(subscription.plan);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-2xl font-semibold text-brand"
        >
          SoundTeacher
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-sm font-medium text-muted hover:text-foreground"
          >
            Çıkış
          </button>
        </form>
      </header>

      <h1 className="mt-12 font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        Path Home
      </h1>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
        Merhaba{session.user.name ? `, ${session.user.name}` : ""}. Aboneliğin geçerli —
        yerleştirme ve dersler Dilim C’de gelecek. Şimdilik bu kabuk entitlement
        kontrolünü gösterir.
      </p>

      <section className="mt-8 rounded-md border border-border bg-surface px-4 py-4 text-sm">
        <h2 className="font-semibold text-foreground">Abonelik</h2>
        <dl className="mt-3 space-y-2">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Plan</dt>
            <dd className="font-medium">{plan?.name ?? subscription.plan}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Durum</dt>
            <dd className="font-medium">{statusLabelTr(subscription.status)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Enstrüman</dt>
            <dd className="font-medium">{subscription.entitlement.instrumentAccess}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Yöntem 2 kota</dt>
            <dd className="font-medium">{subscription.entitlement.quotaMethod2Limit}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6">
        <p className="text-sm text-muted">Açık ders (iskelet)</p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-xl text-foreground">
          Yerleştirme sonrası ilk ders
        </p>
        <button
          type="button"
          disabled
          className="mt-4 inline-flex h-11 cursor-not-allowed items-center justify-center rounded-md bg-brand/40 px-5 text-sm font-semibold text-white"
        >
          Devam et (Dilim C)
        </button>
      </section>

      <form action={simulatePastDueAction} className="mt-12 border-t border-border pt-6">
        <button
          type="submit"
          className="text-sm font-medium text-muted underline-offset-2 hover:text-foreground hover:underline"
        >
          Geliştirici: past_due simüle et → S04
        </button>
      </form>
    </main>
  );
}
