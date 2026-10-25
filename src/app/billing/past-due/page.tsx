import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSubscription } from "@/lib/subscription-store";
import { isPastDue } from "@/lib/subscription";
import { resolvePastDueAction } from "./actions";

export const metadata: Metadata = {
  title: "Ödeme gecikmiş",
  description: "Abonelik past_due duvarı (S04).",
};

/** S04 — Ödeme başarısız / past_due duvarı. */
export default async function PastDuePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const sub = getSubscription(session.user.id);
  if (!sub) {
    redirect("/plans");
  }
  if (!isPastDue(sub.status) && sub.status !== "canceled") {
    redirect("/home");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand"
      >
        SoundTeacher
      </Link>

      <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        Ödemeyi güncelle
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Aboneliğinde bir ödeme sorunu var. Ders ve dinleme şu an kapalı — yargısız, kısa
        bir düzeltme yeterli.
      </p>

      <form action={resolvePastDueAction} className="mt-8 flex flex-col gap-3">
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Ödeme yöntemini güncelle
        </button>
        <p className="text-xs text-muted">
          Mock: buton aboneliği yeniden <strong>active</strong> yapar. Gerçek Stripe
          Customer Portal Dilim B+ test anahtarlarıyla bağlanır.
        </p>
      </form>
    </main>
  );
}
