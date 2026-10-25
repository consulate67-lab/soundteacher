import Link from "next/link";
import { auth } from "@/auth";
import { FloatingNotes } from "@/components/floating-notes";
import { InstrumentGlobe } from "@/components/instrument-globe";
import { PricingSection } from "@/components/pricing-section";

export default async function HomePage() {
  const session = await auth();
  const primaryHref = session?.user ? "/trial-program" : "/signup";
  const pricingHref = session?.user ? "/plans" : "/signup";

  return (
    <main className="min-h-screen">
      <section className="st-hero-plane relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden px-6 pb-14 pt-12 sm:px-10 sm:pb-16">
        <FloatingNotes />

        <div className="relative z-[1] mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div className="max-w-xl">
            <p className="st-fade-up st-brand-mark font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              SoundTeacher
            </p>
            <h1 className="st-fade-up-delay mt-5 font-[family-name:var(--font-display)] text-2xl font-medium leading-snug text-white sm:text-3xl lg:text-4xl">
              Enstrümanını seç, çevrim içi öğretmeninle çal
            </h1>
            <p className="st-fade-up-delay-2 mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
              Yerleştirme, deneme dersleri ve dinleme geri bildirimi — gerçek bir
              öğretmen gibi yol gösterir. Şimdi Piyano açık.
            </p>

            <div className="st-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-6 text-sm font-semibold text-brand-ink transition-transform hover:scale-[1.02] hover:brightness-105"
              >
                {session?.user ? "Deneme programına git" : "Ücretsiz denemeyi başlat"}
              </Link>
              <a
                href="#abonelik"
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/35 bg-white/10 px-6 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/18"
              >
                Abonelik ücretleri
              </a>
              {!session?.user ? (
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-transparent px-4 text-sm font-medium text-white/75 hover:text-white"
                >
                  Giriş yap
                </Link>
              ) : (
                <Link
                  href="/home"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-transparent px-4 text-sm font-medium text-white/75 hover:text-white"
                >
                  Path Home
                </Link>
              )}
            </div>
          </div>

          <div className="st-fade-up-delay-2">
            <InstrumentGlobe ctaHref={primaryHref} />
          </div>
        </div>
      </section>

      <PricingSection ctaHref={pricingHref} />
    </main>
  );
}
