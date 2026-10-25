import type { Band } from "./bands";

export type LessonDef = {
  id: string;
  moduleId: number;
  order: number;
  titles: Record<Band, string>;
};

/** M1–M2 mock catalog (Dilim C). M3+ placeholders locked by module_entry. */
export const LESSONS: LessonDef[] = [
  // Module 1
  {
    id: "piano.m1.l1",
    moduleId: 1,
    order: 1,
    titles: {
      child: "Sandalyede rahat otur",
      teen: "Oturuş ve el",
      adult: "Oturuş ve ergonomi",
    },
  },
  {
    id: "piano.m1.l2",
    moduleId: 1,
    order: 2,
    titles: {
      child: "Orta Do’yu bul",
      teen: "Orta Do haritası",
      adult: "Orta Do referansı",
    },
  },
  {
    id: "piano.m1.l3",
    moduleId: 1,
    order: 3,
    titles: {
      child: "Beyaz ve siyah tuşlar",
      teen: "Siyah tuş grupları",
      adult: "Klavye coğrafyası",
    },
  },
  {
    id: "piano.m1.l4",
    moduleId: 1,
    order: 4,
    titles: {
      child: "Sağ el 5 parmak",
      teen: "Sağ el 5 parmak",
      adult: "Sağ el 5 parmak",
    },
  },
  {
    id: "piano.m1.l5",
    moduleId: 1,
    order: 5,
    titles: {
      child: "Do–Re–Mi mini şarkı",
      teen: "Do–Re–Mi–Fa–Sol",
      adult: "Do’dan Sol’a",
    },
  },
  {
    id: "piano.m1.l6",
    moduleId: 1,
    order: 6,
    titles: {
      child: "Modül 1 gösterisi",
      teen: "Modül 1 kapı parçası",
      adult: "Modül 1 performans",
    },
  },
  // Module 2
  {
    id: "piano.m2.l1",
    moduleId: 2,
    order: 1,
    titles: {
      child: "Sol anahtarı nedir?",
      teen: "Sol anahtarı",
      adult: "Sol anahtarı ve porte",
    },
  },
  {
    id: "piano.m2.l2",
    moduleId: 2,
    order: 2,
    titles: {
      child: "Do–Re–Mi notada",
      teen: "Do–Re–Mi okuma",
      adult: "Do–Re–Mi eşleme",
    },
  },
  {
    id: "piano.m2.l3",
    moduleId: 2,
    order: 3,
    titles: {
      child: "Fa ve Sol",
      teen: "Do–Sol okuma",
      adult: "Do–Sol çizgisi",
    },
  },
  {
    id: "piano.m2.l4",
    moduleId: 2,
    order: 4,
    titles: {
      child: "Dörtlük ve ikilik",
      teen: "Süre değerleri",
      adult: "Dörtlük / ikilik",
    },
  },
  {
    id: "piano.m2.l5",
    moduleId: 2,
    order: 5,
    titles: {
      child: "Birlik ve 4/4",
      teen: "4/4 ölçü",
      adult: "Birlik ve 4/4",
    },
  },
  {
    id: "piano.m2.l6",
    moduleId: 2,
    order: 6,
    titles: {
      child: "Modül 2 kapısı",
      teen: "Modül 2 kapı parçası",
      adult: "Modül 2 performans",
    },
  },
];

export function lessonTitle(lesson: LessonDef, band: Band): string {
  return lesson.titles[band];
}

export function getLesson(id: string): LessonDef | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function firstLessonOfModule(moduleId: number): LessonDef | undefined {
  return LESSONS.find((l) => l.moduleId === moduleId && l.order === 1);
}

export function lessonsForVisiblePath(moduleEntry: number): LessonDef[] {
  // Show entry module + next module preview (locked). M1 always if entry is 1.
  const modules = new Set<number>([moduleEntry]);
  if (moduleEntry < 7) modules.add(moduleEntry + 1);
  if (moduleEntry > 1) modules.add(moduleEntry); // explicit
  // Also show M1 micro note context when entry > 1 — list entry module primarily
  return LESSONS.filter((l) => modules.has(l.moduleId));
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
  if (lesson.moduleId < moduleEntry) {
    // Skipped by placement — not required; treat as locked-skip (not clickable)
    return true;
  }
  if (completedLessonIds.includes(lesson.id)) return false;
  return lesson.id !== openLessonId;
}

/** Next lesson in catalog order within same module, else first of next module. */
export function nextLessonId(currentId: string): string | null {
  const current = getLesson(currentId);
  if (!current) return null;
  const sameModule = LESSONS.filter((l) => l.moduleId === current.moduleId).sort(
    (a, b) => a.order - b.order,
  );
  const idx = sameModule.findIndex((l) => l.id === currentId);
  if (idx >= 0 && idx < sameModule.length - 1) {
    return sameModule[idx + 1].id;
  }
  const nextMod = firstLessonOfModule(current.moduleId + 1);
  return nextMod?.id ?? null;
}
