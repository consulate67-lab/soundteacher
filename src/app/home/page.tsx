import type { Metadata } from "next";
import Link from "next/link";
import { requirePath } from "@/lib/access";
import { BAND_SHORT } from "@/lib/bands";
import {
  getLesson,
  isLessonLocked,
  lessonTitle,
  lessonsForVisiblePath,
  moduleMapStatuses,
} from "@/lib/curriculum";
import { gateMetricsForModule } from "@/lib/gate-metrics";
import { getPlan } from "@/lib/plans";
import { resolveQuotaForUser } from "@/lib/resolve-quota";
import { statusLabelTr } from "@/lib/subscription";
import {
  canAccessLesson,
  hasPaidEntitlement,
  shouldPromptSubscribe,
  TRIAL_COPY,
} from "@/lib/trial-access";
import {
  buildTrialProgram,
  isTrialProgramLessonLocked,
} from "@/lib/trial-program";
import { signOutAction, simulatePastDueAction } from "./actions";

export const metadata: Metadata = {
  title: "Path Home",
  description: "Öğrenme yolu özeti (S20).",
};

/** S20 — Path Home: açık ders + kilitli harita (+ ücretsiz deneme). */
export default async function HomePage() {
  const { session, subscription, path } = await requirePath();
  const paid = hasPaidEntitlement(subscription);
  const plan = subscription ? getPlan(subscription.plan) : null;
  const quota = await resolveQuotaForUser(session.user.id, subscription);
  const open = getLesson(path.openLessonId);
  const openTitle = open ? lessonTitle(open, path.band) : path.openLessonId;
  const openAllowed = canAccessLesson(subscription, path.openLessonId, path);
  const promptSub = shouldPromptSubscribe(subscription, path);
  const trialProgram = !paid ? buildTrialProgram(path) : null;
  const visible = lessonsForVisiblePath(path.moduleEntry);
  const modules = moduleMapStatuses(
    path.moduleEntry,
    path.openLessonId,
    path.completedLessonIds,
  );

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

      {!paid ? (
        <p className="mt-4 rounded-md border border-border bg-brand-soft px-3 py-2 text-sm text-foreground">
          {promptSub ? TRIAL_COPY.bannerSubscribe : TRIAL_COPY.bannerHome}{" "}
          {!promptSub ? (
            <Link
              href="/trial-program"
              className="font-semibold text-brand underline-offset-2 hover:underline"
            >
              Deneme programın
            </Link>
          ) : (
            <Link
              href="/plans"
              className="font-semibold text-brand underline-offset-2 hover:underline"
            >
              Plan seç
            </Link>
          )}
        </p>
      ) : null}

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
              {paid
                ? `${plan?.name} · ${statusLabelTr(subscription!.status)}`
                : "Ücretsiz deneme"}
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
        {openAllowed ? (
          <Link
            href={`/lessons/${path.openLessonId}`}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            {path.completedLessonIds.length === 0 ? "İlk ders" : "Devam et"}
          </Link>
        ) : (
          <Link
            href="/plans"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Abone ol — devam et
          </Link>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-foreground">M1–M4 omurga</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {modules.map((m) => {
            const label =
              m.state === "skipped"
                ? "atlandı"
                : m.state === "done"
                  ? "bitti"
                  : m.state === "current"
                    ? "açık"
                    : "kilitli";
            return (
              <li
                key={m.moduleId}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  m.state === "current"
                    ? "bg-brand text-white"
                    : m.state === "done"
                      ? "bg-brand-soft text-foreground"
                      : "border border-border bg-surface text-muted"
                }`}
                title={gateMetricsForModule(m.moduleId).labelTr}
              >
                M{m.moduleId} · {label}
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm font-semibold text-foreground">Ders haritası</p>
        <p className="mt-1 text-xs text-muted">
          Giriş modülünden M4’e kadar · kilitli dersler S21
          {!paid && trialProgram
            ? ` · deneme: ${trialProgram.items.length} ders ücretsiz`
            : ""}
          .
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {visible.map((lesson) => {
            const sequenceLocked = paid
              ? isLessonLocked(
                  lesson,
                  path.openLessonId,
                  path.completedLessonIds,
                  path.moduleEntry,
                )
              : isTrialProgramLessonLocked(lesson.id, path);
            const entitlementLocked = !canAccessLesson(
              subscription,
              lesson.id,
              path,
            );
            const locked = sequenceLocked || entitlementLocked;
            const done = path.completedLessonIds.includes(lesson.id);
            const title = lessonTitle(lesson, path.band);
            const href = locked
              ? `/lessons/${lesson.id}/locked`
              : `/lessons/${lesson.id}`;

            return (
              <li key={lesson.id}>
                <Link
                  href={href}
                  className={`flex items-center justify-between gap-3 rounded-md border px-3 py-3 text-sm ${
                    locked
                      ? "border-border bg-surface/60 text-muted"
                      : "border-brand bg-brand-soft text-foreground"
                  }`}
                >
                  <span>
                    M{lesson.moduleId}.{lesson.order} · {title}
                  </span>
                  <span className="text-xs font-medium">
                    {done
                      ? "Tamam"
                      : entitlementLocked && !sequenceLocked
                        ? "Abonelik"
                        : locked
                          ? "Kilitli"
                          : "Açık"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {paid ? (
        <form action={simulatePastDueAction} className="mt-12 border-t border-border pt-6">
          <button
            type="submit"
            className="text-sm font-medium text-muted underline-offset-2 hover:text-foreground hover:underline"
          >
            Geliştirici: past_due simüle et → S04
          </button>
        </form>
      ) : null}
    </main>
  );
}
