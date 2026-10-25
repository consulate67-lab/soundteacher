import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PLANS } from "@/lib/plans";
import { isStripeMockMode } from "@/lib/stripe";
import { getSubscription } from "@/lib/subscription-store";
import { hasLessonAccess } from "@/lib/subscription";
import { PlanPicker } from "./plan-picker";

export const metadata: Metadata = {
  title: "Plan seçimi",
  description: "SoundTeacher abonelik planı (S02).",
};

/** S02 — Plan seçimi. */
export default async function PlansPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/plans");
  }

  const sub = getSubscription(session.user.id);
  if (sub && hasLessonAccess(sub.status)) {
    redirect("/home");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand"
      >
        SoundTeacher
      </Link>

      <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        Planını seç
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Cadence: 8 ders / ay. Deneme ücretsiz; abonelik tam Path ve daha yüksek
        dinleme kotası için. Mock ödeme de olur.
      </p>
      <p className="mt-3 text-xs text-muted">
        Henüz denemediysen{" "}
        <Link href="/placement" className="font-medium text-brand hover:underline">
          ücretsiz yerleştirmeye
        </Link>{" "}
        de gidebilirsin.
      </p>

      <PlanPicker plans={PLANS} mockMode={isStripeMockMode()} />
    </main>
  );
}
