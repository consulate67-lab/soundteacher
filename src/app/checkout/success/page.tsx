import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPlan, type PlanId } from "@/lib/plans";
import { getPath } from "@/lib/path-store";
import { activateFromCheckout, getSubscription } from "@/lib/subscription-store";
import { statusLabelTr } from "@/lib/subscription";

export const metadata: Metadata = {
  title: "Ödeme başarılı",
  description: "Abonelik etkinleştirildi (S03).",
};

type Props = {
  searchParams: Promise<{ plan?: string; session_id?: string }>;
};

/** S03 — Ödeme / deneme başarı → yerleştirme veya Path Home. */
export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const plan = getPlan(params.plan)?.id as PlanId | undefined;
  const sessionId = params.session_id;

  const session = await auth();
  if (!session?.user?.id) {
    const q = new URLSearchParams();
    if (params.plan) q.set("plan", params.plan);
    if (params.session_id) q.set("session_id", params.session_id);
    const returnTo = `/checkout/success?${q.toString()}`;
    redirect(`/login?callbackUrl=${encodeURIComponent(returnTo)}`);
  }

  if (!plan || !sessionId) {
    redirect("/plans");
  }

  let subscription = getSubscription(session.user.id);
  if (!subscription || subscription.plan !== plan) {
    subscription = activateFromCheckout({
      userId: session.user.id,
      plan,
      stripeSubId: sessionId.startsWith("cs_mock_") ? null : sessionId,
    });
  } else if (subscription.status !== "active" && subscription.status !== "trial") {
    subscription = activateFromCheckout({
      userId: session.user.id,
      plan,
      stripeSubId: sessionId.startsWith("cs_mock_") ? null : sessionId,
    });
  }

  const path = await getPath(session.user.id);
  const nextHref = path?.placementComplete ? "/home" : "/placement";
  const nextLabel = path?.placementComplete ? "Path Home’a git" : "Yerleştirmeye başla";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand"
      >
        SoundTeacher
      </Link>

      <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        Abonelik etkin
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {plan === "trial"
          ? "Denemen başladı. Sırada yaş × seviye yerleştirme var."
          : "Ödeme alındı (veya mock). Sırada yerleştirme — Path bundan sonra açılır."}
      </p>

      <dl className="mt-8 space-y-3 rounded-md border border-border bg-surface px-4 py-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Plan</dt>
          <dd className="font-medium">{getPlan(plan)?.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Durum</dt>
          <dd className="font-medium">{statusLabelTr(subscription.status)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Oturum</dt>
          <dd className="max-w-[12rem] truncate font-mono text-xs">{sessionId}</dd>
        </div>
      </dl>

      <Link
        href={nextHref}
        className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
      >
        {nextLabel}
      </Link>
    </main>
  );
}
