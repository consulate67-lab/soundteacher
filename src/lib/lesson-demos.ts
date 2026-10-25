/**
 * Real-human hand demo registry for theory/practice steps.
 * Files live under /public/lessons/demos/{id}.mp4 (+ optional .webm / -poster.jpg).
 */

export type LessonDemoMeta = {
  id: string;
  /** Public path without extension preference — player tries webm then mp4. */
  base: string;
  /** TR lower-third theme (also burned into the file). */
  titleTr: string;
  sourceNote: string;
};

export const LESSON_DEMOS: Record<string, LessonDemoMeta> = {
  "m1-l1-sit": {
    id: "m1-l1-sit",
    base: "/lessons/demos/m1-l1-sit",
    titleTr: "Oturuş · ayaklar yerde · mesafe",
    sourceNote: "Pexels Charles Parker 6647098",
  },
  "m1-l1-hands-rest": {
    id: "m1-l1-hands-rest",
    base: "/lessons/demos/m1-l1-hands-rest",
    titleTr: "Eller tuşta · basmadan dur",
    sourceNote: "Mixkit 41672",
  },
  "m1-l2-black-2": {
    id: "m1-l2-black-2",
    base: "/lessons/demos/m1-l2-black-2",
    titleTr: "İki siyahlı grup · parmakla göster",
    sourceNote: "Pexels Alena Darmel 7722453",
  },
  "m1-l2-black-3": {
    id: "m1-l2-black-3",
    base: "/lessons/demos/m1-l2-black-3",
    titleTr: "Üç siyahlı grup · bir-iki-üç",
    sourceNote: "Pexels Yan Krukau 8520315",
  },
  "m1-l3-fingers-2": {
    id: "m1-l3-fingers-2",
    base: "/lessons/demos/m1-l3-fingers-2",
    titleTr: "2–3. parmak · iki siyah tuş",
    sourceNote: "Mixkit 44144",
  },
  "m1-l3-fingers-3": {
    id: "m1-l3-fingers-3",
    base: "/lessons/demos/m1-l3-fingers-3",
    titleTr: "2–3–4 · üç siyah tuş",
    sourceNote: "Mixkit 44143",
  },
  "m1-l4-middle-c": {
    id: "m1-l4-middle-c",
    base: "/lessons/demos/m1-l4-middle-c",
    titleTr: "Orta Do · iki siyahın solu",
    sourceNote: "Mixkit 50330 + caption focus",
  },
  "m1-l5-five-finger": {
    id: "m1-l5-five-finger",
    base: "/lessons/demos/m1-l5-five-finger",
    titleTr: "Do pozisyonu · 1–5 yürüyüş",
    sourceNote: "Mixkit 41667",
  },
  "m1-l5-drm": {
    id: "m1-l5-drm",
    base: "/lessons/demos/m1-l5-drm",
    titleTr: "Do Re Mi · parmak iniş noktaları",
    sourceNote: "Mixkit 41671",
  },
  "m1-l6-gate": {
    id: "m1-l6-gate",
    base: "/lessons/demos/m1-l6-gate",
    titleTr: "Kapı · Do–Re–Mi–Re–Do",
    sourceNote: "Mixkit 43774",
  },
};

export function demoMeta(id: string | undefined | null): LessonDemoMeta | null {
  if (!id) return null;
  return LESSON_DEMOS[id] ?? null;
}
