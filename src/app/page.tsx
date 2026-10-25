import Link from "next/link";

export default function HomePage() {
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
        iskeleti (Dilim A) — henüz gerçek ödeme veya dinleme yok.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/signup"
          className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Hesap oluştur
        </Link>
        <a
          href="/api/health"
          className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-medium text-foreground transition-colors hover:bg-brand-soft"
        >
          Healthcheck
        </a>
      </div>
    </main>
  );
}
