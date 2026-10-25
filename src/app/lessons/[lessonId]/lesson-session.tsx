import Link from "next/link";
import { ListeningFeedback } from "@/components/listening-feedback";
import { ListeningHandoff } from "@/components/listening-handoff";
import { TeacherBubble } from "@/components/teacher-bubble";
import type { Band } from "@/lib/bands";
import { getAttempt } from "@/lib/attempt-store";
import { primaryError } from "@/lib/attempt";
import { nextLessonId } from "@/lib/curriculum";
import { gateFailBubble, gatePassBubble } from "@/lib/feedback-copy";
import { loadLessonContent, pickBand } from "@/lib/lesson-content";
import type { LessonProgressRecord } from "@/lib/lesson-progress-store";
import type { QuotaSnapshot } from "@/lib/quota";
import {
  advanceToListeningAction,
  advanceToPracticeAction,
  softRetryAction,
} from "./actions";

type Props = {
  lessonId: string;
  band: Band;
  title: string;
  sessionMinutes: number;
  progress: LessonProgressRecord;
  quota: QuotaSnapshot;
};

export function LessonSession({
  lessonId,
  band,
  title,
  sessionMinutes,
  progress,
  quota,
}: Props) {
  const content = loadLessonContent(lessonId);
  if (!content) {
    return <p className="text-sm text-danger">Ders içeriği bulunamadı.</p>;
  }

  const phase = progress.phase;
  const nextId = nextLessonId(lessonId);
  const lastAttempt = progress.lastAttemptId ? getAttempt(progress.lastAttemptId) : null;

  return (
    <div className="mt-8 flex flex-col gap-6">
      <PhaseRail phase={phase} />

      {phase === "theory" ? (
        <section className="flex flex-col gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-medium">
            Teori
          </h2>
          <p className="text-sm text-muted">{pickBand(content.goals, band)}</p>
          {content.theoryBubbles.map((b, i) => (
            <TeacherBubble
              key={i}
              text={pickBand(b, band)}
              band={band}
              autoSpeak={i === 0}
            />
          ))}
          <form action={advanceToPracticeAction.bind(null, lessonId)}>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Pratiğe geç
            </button>
          </form>
        </section>
      ) : null}

      {phase === "practice" ? (
        <section className="flex flex-col gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-medium">
            Pratik
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {content.practiceSteps.map((step, i) => (
              <li key={i}>{pickBand(step, band)}</li>
            ))}
          </ol>
          {content.practiceBubbles.map((b, i) => (
            <TeacherBubble key={i} text={pickBand(b, band)} band={band} />
          ))}
          <p className="text-xs text-muted">Tempo: yavaş · ~{sessionMinutes} dk oturum</p>
          <form action={advanceToListeningAction.bind(null, lessonId)}>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Dinlemeye hazırım
            </button>
          </form>
        </section>
      ) : null}

      {phase === "listening" ? (
        <ListeningHandoff
          lessonId={lessonId}
          band={band}
          prepText={pickBand(content.listeningPrep, band)}
          recommendedMethod={content.recommendedMethod}
          allowedMethods={content.allowedMethods}
          quota={quota}
        />
      ) : null}

      {phase === "feedback" && lastAttempt ? (
        <ListeningFeedback attempt={lastAttempt} band={band} lessonId={lessonId} />
      ) : null}

      {phase === "feedback" && !lastAttempt ? (
        <p className="text-sm text-danger">
          Attempt bulunamadı. Dinlemeyi yeniden başlat.
        </p>
      ) : null}

      {phase === "gate_fail" ? (
        <section className="flex flex-col gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-medium">
            Kapı — soft retry
          </h2>
          <TeacherBubble
            text={gateFailBubble(
              band,
              lastAttempt ? primaryError(lastAttempt.errorSpans) : null,
            )}
            band={band}
            autoSpeak
          />
          <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm">
            Mikro hedef: {pickBand(content.failMicroTarget, band)}
          </p>
          <form action={softRetryAction.bind(null, lessonId)}>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Tekrar dene
            </button>
          </form>
          <Link href="/home" className="text-sm text-muted hover:text-foreground">
            Path Home’a dön
          </Link>
        </section>
      ) : null}

      {phase === "gate_pass" || phase === "unlock" ? (
        <section className="flex flex-col gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-medium">
            Kapı geçildi · unlock
          </h2>
          <TeacherBubble text={gatePassBubble(band)} band={band} autoSpeak />
          <p className="text-sm text-muted">
            {title} tamamlandı. Path güncellendi (S38).
          </p>
          <div className="flex flex-wrap gap-3">
            {nextId ? (
              <Link
                href={`/lessons/${nextId}`}
                className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
              >
                Sonraki ders
              </Link>
            ) : null}
            <Link
              href="/home"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-medium hover:bg-brand-soft"
            >
              Path Home
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function PhaseRail({ phase }: { phase: LessonProgressRecord["phase"] }) {
  const steps: { id: LessonProgressRecord["phase"][]; label: string }[] = [
    { id: ["theory"], label: "Teori" },
    { id: ["practice"], label: "Pratik" },
    { id: ["listening", "feedback"], label: "Dinleme" },
    { id: ["gate_pass", "gate_fail", "unlock"], label: "Kapı" },
  ];

  return (
    <ol className="flex flex-wrap gap-2 text-xs">
      {steps.map((step) => {
        const active = step.id.includes(phase);
        return (
          <li
            key={step.label}
            className={`rounded-md px-2.5 py-1 ${
              active
                ? "bg-brand text-white"
                : "border border-border bg-surface text-muted"
            }`}
          >
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}
