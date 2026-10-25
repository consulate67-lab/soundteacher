import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePath } from "@/lib/access";
import { getLesson, isLessonLocked, lessonTitle } from "@/lib/curriculum";

type Props = {
  params: Promise<{ lessonId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  return { title: lessonId };
}

/** Open lesson shell — Dilim D will add theory/practice. */
export default async function LessonPage({ params }: Props) {
  const { path } = await requirePath();
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);

  if (!lesson) {
    redirect("/home");
  }

  if (
    isLessonLocked(lesson, path.openLessonId, path.completedLessonIds, path.moduleEntry)
  ) {
    redirect(`/lessons/${lessonId}/locked`);
  }

  const title = lessonTitle(lesson, path.band);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-6 py-12">
      <Link href="/home" className="text-sm font-medium text-brand hover:underline">
        ← Path Home
      </Link>

      <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted">
        Ders kabuğu (Dilim C). Teori → pratik → dinleme → gate Dilim D/E’de gelecek.
        Oturum hedefi: ~{path.defaultSessionMinutes} dk.
      </p>

      <ol className="mt-8 list-decimal space-y-2 pl-5 text-sm text-foreground">
        <li>Teori — kısa hedef (S30)</li>
        <li>Pratik — yönlendirilmiş istem (S31)</li>
        <li>Dinleme — Yöntem 1/2 (S32+)</li>
        <li>Kapı — unlock (S36–S38)</li>
      </ol>

      <Link
        href="/home"
        className="mt-10 inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-medium hover:bg-brand-soft"
      >
        Home’a dön
      </Link>
    </main>
  );
}
