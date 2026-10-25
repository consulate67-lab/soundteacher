import type { Band } from "./bands";
import {
  firstLessonOfModule,
  getLesson,
  lessonTitle,
  nextLessonId,
} from "./curriculum";
import { loadLessonContent } from "./lesson-content";
import type { Level } from "./placement";
import type { PathRecord } from "./path-store";

export type TrialProgramItem = {
  lessonId: string;
  order: number;
  title: string;
  goal: string;
  minutes: number;
  moduleId: number;
  lessonOrder: number;
};

export type TrialProgram = {
  band: Band;
  level: Level;
  moduleEntry: number;
  title: string;
  blurb: string;
  items: TrialProgramItem[];
  firstLessonId: string;
  totalMinutes: number;
};

/**
 * Deneme ders programı — M1–M2 omurgasından 3–4 kısa ders, yerleştirme sonucuna göre.
 * Abonelik yokken bu listedeki dersler ücretsiz açılır.
 */
export function trialProgramLessonIds(input: {
  level: Level;
  moduleEntry: number;
}): string[] {
  const entry = Math.min(Math.max(input.moduleEntry, 1), 4);

  if (entry <= 1 || input.level === "A0") {
    return ["piano.m1.l1", "piano.m1.l2", "piano.m1.l3", "piano.m1.l4"];
  }

  if (entry === 2 || input.level === "A1") {
    // A1: M1 mikro fırça + M2 giriş
    return ["piano.m1.l1", "piano.m1.l2", "piano.m2.l1", "piano.m2.l2"];
  }

  // A2+ (giriş M4+): kısa M1 hatırlatma + giriş modülünden 2 ders tadı
  const first = firstLessonOfModule(entry);
  const second = first ? nextLessonId(first.id) : null;
  const ids = ["piano.m1.l1", "piano.m1.l2"];
  if (first) ids.push(first.id);
  if (second) ids.push(second);
  return ids.slice(0, 4);
}

export function buildTrialProgram(
  path: Pick<
    PathRecord,
    "band" | "level" | "moduleEntry" | "defaultSessionMinutes"
  >,
): TrialProgram {
  const ids = trialProgramLessonIds(path);
  const minutesEach = Math.min(
    path.defaultSessionMinutes,
    Math.max(8, path.defaultSessionMinutes - 2),
  );

  const items: TrialProgramItem[] = ids.map((lessonId, i) => {
    const lesson = getLesson(lessonId);
    const content = loadLessonContent(lessonId);
    const title = lesson
      ? lessonTitle(lesson, path.band)
      : lessonId;
    const goal =
      content?.goals[path.band] ??
      (path.band === "adult"
        ? `${title} hedefini bilinçli uygulayın.`
        : `${title} hedefini netleştir.`);

    return {
      lessonId,
      order: i + 1,
      title,
      goal,
      minutes: minutesEach,
      moduleId: lesson?.moduleId ?? 1,
      lessonOrder: lesson?.order ?? i + 1,
    };
  });

  const firstLessonId = items[0]?.lessonId ?? "piano.m1.l1";
  const totalMinutes = items.reduce((sum, it) => sum + it.minutes, 0);

  return {
    band: path.band,
    level: path.level,
    moduleEntry: path.moduleEntry,
    title: programTitle(path.band, path.level),
    blurb: programBlurb(path.band, path.level, path.moduleEntry),
    items,
    firstLessonId,
    totalMinutes,
  };
}

function programTitle(band: Band, level: Level): string {
  if (band === "child") return `Deneme programın (${level})`;
  if (band === "teen") return `Deneme programın · ${level}`;
  return `Deneme programınız · ${level}`;
}

function programBlurb(band: Band, level: Level, moduleEntry: number): string {
  if (band === "child") {
    return `Kısa ve eğlenceli ${level} denemesi — abonelik yok. Modül ${moduleEntry} yoluna hazırlanırsın.`;
  }
  if (band === "teen") {
    return `Ücretsiz deneme paketi (${level}). Abonelik sonra; şimdilik bu sırayı bitir.`;
  }
  return `Ücretsiz deneme programı (${level}, giriş M${moduleEntry}). Abonelik tam Path için — istediğiniz zaman.`;
}

/** Sequence lock inside deneme programı (moduleEntry skip uygulanmaz). */
export function isTrialProgramLessonLocked(
  lessonId: string,
  path: PathRecord,
): boolean {
  const program = trialProgramLessonIds(path);
  if (!program.includes(lessonId)) return true;
  if (path.completedLessonIds.includes(lessonId)) return false;
  const firstOpen = program.find((id) => !path.completedLessonIds.includes(id));
  return lessonId !== firstOpen;
}

export function nextTrialProgramLessonId(
  path: PathRecord,
  completedLessonId: string,
): string | null {
  const program = trialProgramLessonIds(path);
  const idx = program.indexOf(completedLessonId);
  if (idx >= 0 && idx < program.length - 1) return program[idx + 1];
  return null;
}

export function isTrialProgramComplete(path: PathRecord): boolean {
  const program = trialProgramLessonIds(path);
  return program.every((id) => path.completedLessonIds.includes(id));
}
