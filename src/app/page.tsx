import Link from "next/link";
import { auth } from "@/auth";
import { isStripeMockMode } from "@/lib/stripe";

export default async function HomePage() {
  const session = await auth();
  const mockBilling = isStripeMockMode();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <p className="mb-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-brand sm:text-5xl">
        SoundTeacher
      </p>
      <p className="mb-2 text-sm text-muted">SoungTeacher</p>
      <h1 className="max-w-xl font-[family-name:var(--font-display)] text-2xl font-medium leading-snug text-foreground sm:text-3xl">
        Piyano için çevrim içi öğretmen
      </h1>
      <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
        Abonelik, yaş × seviye öğrenme yolu ve çaldığını dinleyen geri bildirim. Faz 1
        Dilim A–C: Auth.js, Stripe mock billing, yerleştirme ve Path Home.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        {session?.user ? (
          <Link
            href="/home"
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Path Home
          </Link>
        ) : (
          <Link
            href="/signup"
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Hesap oluştur
          </Link>
        )}
        <Link
          href="/plans"
          className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-medium text-foreground transition-colors hover:bg-brand-soft"
        >
          Planlar (S02)
        </Link>
        <a
          href="/api/health"
          className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-medium text-foreground transition-colors hover:bg-brand-soft"
        >
          Healthcheck
        </a>
      </div>

      <p className="mt-8 text-xs text-muted">
        Billing: {mockBilling ? "mock mode (anahtar yok)" : "Stripe test keys present"}
        {session?.user?.email ? ` · oturum: ${session.user.email}` : ""}
      </p>
    </main>
  );
}
