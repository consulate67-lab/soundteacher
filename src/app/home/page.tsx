import type { Metadata } from "next";
import Link from "next/link";
import { requirePath } from "@/lib/access";
import { BAND_SHORT } from "@/lib/bands";
import {
  getLesson,
  isLessonLocked,
  lessonTitle,
  lessonsForVisiblePath,
} from "@/lib/curriculum";
import { getPlan } from "@/lib/plans";
import { quotaSnapshot } from "@/lib/quota";
import { statusLabelTr } from "@/lib/subscription";
import { signOutAction, simulatePastDueAction } from "./actions";

export const metadata: Metadata = {
  title: "Path Home",
  description: "Öğrenme yolu özeti (S20).",
};

/** S20 — Path Home: açık ders + kilitli harita. */
export default async function HomePage() {
  const { session, subscription, path } = await requirePath();
  const plan = getPlan(subscription.plan);
  const quota = quotaSnapshot(subscription);
  const open = getLesson(path.openLessonId);
  const openTitle = open ? lessonTitle(open, path.band) : path.openLessonId;
  const visible = lessonsForVisiblePath(path.moduleEntry);

  const progressHint =
    path.band === "child"
      ? "Küçük adımlarla ilerliyorsun — her ders bir zafer."
      : path.band === "teen"
        ? "İlerleme sade: açık dersi bitir, sıradaki açılsın."
        : "Checklist: açık dersi tamamla, sonraki kapı açılsın.";

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
        Merhaba{session.user.name ? `, ${session.user.name}` : ""}. {progressHint}
      </p>

      <section className="mt-8 rounded-md border border-border bg-surface px-4 py-4 text-sm">
        <h2 className="font-semibold text-foreground">Yolun</h2>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="flex justify-between gap-2 sm:block">
            <dt className="text-muted">Bant / seviye</dt>
            <dd className="font-medium">
              {BAND_SHORT[path.band]} · {path.level}
            </dd>
          </div>
          <div className="flex justify-between gap-2 sm:block">
            <dt className="text-muted">Modül girişi</dt>
            <dd className="font-medium">M{path.moduleEntry}</dd>
          </div>
          <div className="flex justify-between gap-2 sm:block">
            <dt className="text-muted">Oturum</dt>
            <dd className="font-medium">~{path.defaultSessionMinutes} dk</dd>
          </div>
          <div className="flex justify-between gap-2 sm:block">
            <dt className="text-muted">Abonelik</dt>
            <dd className="font-medium">
              {plan?.name} · {statusLabelTr(subscription.status)}
            </dd>
          </div>
          <div className="flex justify-between gap-2 sm:block">
            <dt className="text-muted">Dinleme kotası</dt>
            <dd className="font-medium">
              Y1 {quota.method1Used}/{quota.method1Limit} · Y2 {quota.method2Used}/
              {quota.method2Limit}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-8">
        <p className="text-sm text-muted">Açık ders</p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-xl text-foreground">
          {openTitle}
        </p>
        <Link
          href={`/lessons/${path.openLessonId}`}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          {path.completedLessonIds.length === 0 ? "İlk ders" : "Devam et"}
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-foreground">Modül haritası</h2>
        <p className="mt-1 text-xs text-muted">
          Sıkı sıra: kilitli dersler görünür, tıklanınca S21.
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {visible.map((lesson) => {
            const locked = isLessonLocked(
              lesson,
              path.openLessonId,
              path.completedLessonIds,
              path.moduleEntry,
            );
            const done = path.completedLessonIds.includes(lesson.id);
            const title = lessonTitle(lesson, path.band);
            const href = locked
              ? `/lessons/${lesson.id}/locked`
              : `/lessons/${lesson.id}`;

            return (
              <li key={lesson.id}>
                {locked ? (
                  <Link
                    href={href}
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface/60 px-3 py-3 text-sm text-muted"
                  >
                    <span>
                      M{lesson.moduleId}.{lesson.order} · {title}
                    </span>
                    <span className="text-xs">Kilitli</span>
                  </Link>
                ) : (
                  <Link
                    href={href}
                    className="flex items-center justify-between gap-3 rounded-md border border-brand bg-brand-soft px-3 py-3 text-sm text-foreground"
                  >
                    <span>
                      M{lesson.moduleId}.{lesson.order} · {title}
                    </span>
                    <span className="text-xs font-medium text-brand">
                      {done ? "Tamam" : "Açık"}
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
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
