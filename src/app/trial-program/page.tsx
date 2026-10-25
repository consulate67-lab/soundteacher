import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TrialProgramBootstrap } from "@/components/trial-program-bootstrap";
import { requirePlacementAccess } from "@/lib/access";
import { BAND_SHORT } from "@/lib/bands";
import { getPath } from "@/lib/path-store";
import { hasPaidEntitlement, TRIAL_COPY } from "@/lib/trial-access";
import { buildTrialProgram } from "@/lib/trial-program";

export const metadata: Metadata = {
  title: "Deneme programı",
  description: "Yerleştirmeye göre ücretsiz deneme ders programı.",
};

/**
 * After placement — free trial lesson program.
 * If Path cookie is missing, render client bootstrap (restore from localStorage)
 * instead of redirecting to /placement (that caused the browser loop).
 */
export default async function TrialProgramPage() {
  const { session, subscription } = await requirePlacementAccess();

  if (hasPaidEntitlement(subscription)) {
    redirect("/home");
  }

  const path = await getPath(session.user.id);
  if (!path?.placementComplete) {
    return <TrialProgramBootstrap />;
  }

  const program = buildTrialProgram(path);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-6 py-12">
      <Link
        href="/"
        className="st-fade-up mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand"
      >
        SoundTeacher
      </Link>

      <p className="st-fade-up text-xs font-medium uppercase tracking-[0.14em] text-accent">
        {TRIAL_COPY.programEyebrow} · ücretsiz
      </p>
      <h1 className="st-fade-up-delay mt-2 font-[family-name:var(--font-display)] text-3xl font-medium text-foreground sm:text-4xl">
        {program.title}
      </h1>
      <p className="st-fade-up-delay mt-2 text-sm leading-relaxed text-muted">
        {program.blurb}
      </p>

      <dl className="st-fade-up-delay-2 mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <div>
          <span className="text-muted">Bant </span>
          <span className="font-medium text-foreground">
            {BAND_SHORT[program.band]}
          </span>
        </div>
        <div>
          <span className="text-muted">Seviye </span>
          <span className="font-medium text-foreground">{program.level}</span>
        </div>
        <div>
          <span className="text-muted">Süre </span>
          <span className="font-medium text-foreground">
            ~{program.totalMinutes} dk toplam
          </span>
        </div>
      </dl>

      <ol className="st-fade-up-delay-2 mt-8 flex flex-col gap-3">
        {program.items.map((item) => (
          <li key={item.lessonId} className="st-panel px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-[family-name:var(--font-display)] text-base font-medium text-foreground">
                <span className="mr-2 text-sm text-brand">{item.order}.</span>
                {item.title}
              </p>
              <span className="shrink-0 text-xs text-muted">~{item.minutes} dk</span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted">{item.goal}</p>
            <p className="mt-1 font-mono text-[0.65rem] text-muted">
              M{item.moduleId}.{item.lessonOrder}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Bu paket abonelik gerektirmez. Program bitince tam Path için plan
        seçebilirsin.
      </p>

      <Link
        href={`/lessons/${program.firstLessonId}`}
        className="mt-6 inline-flex h-12 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
      >
        {TRIAL_COPY.ctaFirstLesson}
      </Link>

      <Link
        href="/home"
        className="mt-3 text-center text-sm text-muted hover:text-foreground"
      >
        Path Home’a git
      </Link>

      <p className="mt-8 text-center text-xs text-muted">
        Merhaba{session.user.name ? `, ${session.user.name}` : ""}.
      </p>
    </main>
  );
}
