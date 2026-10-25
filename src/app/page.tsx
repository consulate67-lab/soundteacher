import Link from "next/link";
import { auth } from "@/auth";
import { TRIAL_COPY } from "@/lib/trial-access";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="min-h-screen">
      <section className="st-hero-plane flex min-h-[100svh] w-full flex-col justify-end px-6 pb-16 pt-10 sm:justify-center sm:px-10 sm:pb-20">
        <div className="mx-auto w-full max-w-3xl">
          <p className="st-fade-up st-brand-mark font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight sm:text-7xl">
            SoundTeacher
          </p>
          <h1 className="st-fade-up-delay mt-5 max-w-xl font-[family-name:var(--font-display)] text-2xl font-medium leading-snug text-white sm:text-4xl">
            Piyano için çevrim içi öğretmen
          </h1>
          <p className="st-fade-up-delay-2 mt-4 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
            {TRIAL_COPY.landingBlurb}
          </p>

          <div className="st-fade-up-delay-2 mt-10 flex flex-wrap gap-3">
            {session?.user ? (
              <Link
                href="/trial-program"
                className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-6 text-sm font-semibold text-brand-ink transition-transform hover:scale-[1.02] hover:brightness-105"
              >
                Deneme programına git
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-6 text-sm font-semibold text-brand-ink transition-transform hover:scale-[1.02] hover:brightness-105"
              >
                {TRIAL_COPY.ctaStart}
              </Link>
            )}
            {!session?.user ? (
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/35 bg-white/10 px-6 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/18"
              >
                Giriş yap
              </Link>
            ) : (
              <Link
                href="/home"
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/35 bg-white/10 px-6 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/18"
              >
                Path Home
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
