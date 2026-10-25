import type { Band } from "./bands";
import { scoreRefForLesson } from "./gate-metrics";

export type LessonDef = {
  id: string;
  moduleId: number;
  order: number;
  titles: Record<Band, string>;
  /** Dilim G — score / MusicXML stub id for alignment later. */
  scoreRef: string;
  /** True for *.l6 module gate pieces. */
  isGate: boolean;
};

function L(moduleId: number, order: number, titles: Record<Band, string>): LessonDef {
  const isGate = order === 6;
  return {
    id: `piano.m${moduleId}.l${order}`,
    moduleId,
    order,
    titles,
    isGate,
    scoreRef: scoreRefForLesson(moduleId, order, isGate),
  };
}

/** M1–M4 spine (Dilim G). Shared IDs; band titles overlay. */
export const LESSONS: LessonDef[] = [
  // —— Module 1 ——
  L(1, 1, {
    child: "Sandalyede rahat otur",
    teen: "Oturuş ve el",
    adult: "Oturuş ve ergonomi",
  }),
  L(1, 2, {
    child: "Orta Do’yu bul",
    teen: "Orta Do haritası",
    adult: "Orta Do referansı",
  }),
  L(1, 3, {
    child: "Beyaz ve siyah tuşlar",
    teen: "Siyah tuş grupları",
    adult: "Klavye coğrafyası",
  }),
  L(1, 4, {
    child: "Sağ el 5 parmak",
    teen: "Sağ el 5 parmak",
    adult: "Sağ el 5 parmak",
  }),
  L(1, 5, {
    child: "Do–Re–Mi mini şarkı",
    teen: "Do–Re–Mi–Fa–Sol",
    adult: "Do’dan Sol’a",
  }),
  L(1, 6, {
    child: "Modül 1 gösterisi",
    teen: "Modül 1 kapı parçası",
    adult: "Modül 1 performans",
  }),
  // —— Module 2 ——
  L(2, 1, {
    child: "Sol anahtarı nedir?",
    teen: "Sol anahtarı ve porte",
    adult: "Sol anahtarı temeli",
  }),
  L(2, 2, {
    child: "Do–Re–Mi notada",
    teen: "Do–Sol okuma",
    adult: "Do–Sol okuma drili",
  }),
  L(2, 3, {
    child: "Fa ve Sol",
    teen: "Dörtlük / ikilik",
    adult: "Süreler: dörtlük, ikilik, birlik",
  }),
  L(2, 4, {
    child: "Dörtlük ve ikilik",
    teen: "Birlik ve bağlama",
    adult: "4/4 ölçü hissi",
  }),
  L(2, 5, {
    child: "Birlik ve 4/4",
    teen: "Basit ezgi notadan",
    adult: "Ezgi okuma",
  }),
  L(2, 6, {
    child: "Modül 2 kapısı",
    teen: "Modül 2 kapı performansı",
    adult: "Modül 2 performans kapısı",
  }),
  // —— Module 3 ——
  L(3, 1, {
    child: "Sol el merhaba",
    teen: "Sol el pozisyonu",
    adult: "Sol el ergonomisi",
  }),
  L(3, 2, {
    child: "Sol el 5 parmak",
    teen: "Sol el 5 parmak",
    adult: "Sol el 5 parmak",
  }),
  L(3, 3, {
    child: "Do–Mi–Sol bul",
    teen: "Do majör üçlü haritası",
    adult: "Do majör üçlüsü",
  }),
  L(3, 4, {
    child: "Kırık üçlü",
    teen: "Kırık üçlü kalıbı",
    adult: "Kırık üçlü",
  }),
  L(3, 5, {
    child: "Sırayla eller",
    teen: "Eller sırayla",
    adult: "Alternatif eller",
  }),
  L(3, 6, {
    child: "Modül 3 gösterisi",
    teen: "Modül 3 kapı parçası",
    adult: "Modül 3 performans",
  }),
  // —— Module 4 ——
  L(4, 1, {
    child: "Aynı anda dokun",
    teen: "Eşzamanlı giriş",
    adult: "Eşzamanlı kontrol",
  }),
  L(4, 2, {
    child: "Yavaş birlikte yürüyüş",
    teen: "Sabit bas + melodi",
    adult: "Pedal bas + melodi",
  }),
  L(4, 3, {
    child: "Melodi + tek bas",
    teen: "Kırık bas eşlik",
    adult: "Kırık üçlü eşlik",
  }),
  L(4, 4, {
    child: "Melodi + kırık bas",
    teen: "Tempo birliği",
    adult: "Bağımsızlık ve tempo",
  }),
  L(4, 5, {
    child: "Kısa ezgi düzenlemesi",
    teen: "Kısa düzenleme",
    adult: "Kısa ezgi düzenlemesi",
  }),
  L(4, 6, {
    child: "Modül 4 kapısı",
    teen: "Modül 4 kapı performansı",
    adult: "Modül 4 performans kapısı",
  }),
];

export const MAX_MVP_MODULE = 4;

export function lessonTitle(lesson: LessonDef, band: Band): string {
  return lesson.titles[band];
}

export function getLesson(id: string): LessonDef | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function firstLessonOfModule(moduleId: number): LessonDef | undefined {
  return LESSONS.find((l) => l.moduleId === moduleId && l.order === 1);
}

export function lessonsInModule(moduleId: number): LessonDef[] {
  return LESSONS.filter((l) => l.moduleId === moduleId).sort((a, b) => a.order - b.order);
}

/**
 * Path Home lesson list: from placement entry through M4 (MVP scope).
 * Skipped modules (< entry) are omitted; later modules stay locked until open.
 */
export function lessonsForVisiblePath(moduleEntry: number): LessonDef[] {
  const start = Math.min(Math.max(moduleEntry, 1), MAX_MVP_MODULE);
  return LESSONS.filter((l) => l.moduleId >= start && l.moduleId <= MAX_MVP_MODULE);
}

export type ModuleMapStatus = {
  moduleId: number;
  state: "skipped" | "locked" | "current" | "done";
};

export function moduleMapStatuses(
  moduleEntry: number,
  openLessonId: string,
  completedLessonIds: string[],
): ModuleMapStatus[] {
  const open = getLesson(openLessonId);
  return [1, 2, 3, 4].map((moduleId) => {
    if (moduleId < moduleEntry) return { moduleId, state: "skipped" as const };
    const inMod = lessonsInModule(moduleId);
    const allDone = inMod.every((l) => completedLessonIds.includes(l.id));
    if (allDone) return { moduleId, state: "done" as const };
    if (open?.moduleId === moduleId) return { moduleId, state: "current" as const };
    if (moduleId > (open?.moduleId ?? moduleEntry)) {
      return { moduleId, state: "locked" as const };
    }
    return { moduleId, state: "current" as const };
  });
}

export function isLessonUnlocked(
  lessonId: string,
  openLessonId: string,
  completedLessonIds: string[],
): boolean {
  if (completedLessonIds.includes(lessonId)) return true;
  return lessonId === openLessonId;
}

export function isLessonLocked(
  lesson: LessonDef,
  openLessonId: string,
  completedLessonIds: string[],
  moduleEntry: number,
): boolean {
  if (lesson.moduleId < moduleEntry) return true;
  if (completedLessonIds.includes(lesson.id)) return false;
  return lesson.id !== openLessonId;
}

export function nextLessonId(currentId: string): string | null {
  const current = getLesson(currentId);
  if (!current) return null;
  const sameModule = lessonsInModule(current.moduleId);
  const idx = sameModule.findIndex((l) => l.id === currentId);
  if (idx >= 0 && idx < sameModule.length - 1) {
    return sameModule[idx + 1].id;
  }
  if (current.moduleId >= MAX_MVP_MODULE) return null;
  return firstLessonOfModule(current.moduleId + 1)?.id ?? null;
}

export function previousLessonId(currentId: string): string | null {
  const current = getLesson(currentId);
  if (!current) return null;
  const sameModule = lessonsInModule(current.moduleId);
  const idx = sameModule.findIndex((l) => l.id === currentId);
  if (idx > 0) {
    return sameModule[idx - 1].id;
  }
  if (current.moduleId <= 1) return null;
  const prevModule = lessonsInModule(current.moduleId - 1);
  return prevModule[prevModule.length - 1]?.id ?? null;
}
