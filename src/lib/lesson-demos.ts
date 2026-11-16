/**
 * Real-human hand demo registry for theory/practice steps.
 * Files live under /public/lessons/demos/{id}.mp4 (+ optional .webm / -poster.jpg).
 * Prefer overhead framing; piano notes layered from FluidR3 GM when the step teaches pitches.
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
    sourceNote: "Pexels Charles Parker 6647098 (posture side)",
  },
  "m1-l1-hands-rest": {
    id: "m1-l1-hands-rest",
    base: "/lessons/demos/m1-l1-hands-rest",
    titleTr: "Eller tuşta · basmadan dur",
    sourceNote: "Mixkit 45552 top-down",
  },
  "m1-l2-black-2": {
    id: "m1-l2-black-2",
    base: "/lessons/demos/m1-l2-black-2",
    titleTr: "İki siyahlı grup · parmakla göster",
    sourceNote: "Pexels 5390438 high-angle + FluidR3 Db/Eb",
  },
  "m1-l2-black-3": {
    id: "m1-l2-black-3",
    base: "/lessons/demos/m1-l2-black-3",
    titleTr: "Üç siyahlı grup · bir-iki-üç",
    sourceNote: "Mixkit 46734 top view + FluidR3 Gb/Ab/Bb",
  },
  "m1-l3-fingers-2": {
    id: "m1-l3-fingers-2",
    base: "/lessons/demos/m1-l3-fingers-2",
    titleTr: "2–3. parmak · iki siyah tuş",
    sourceNote: "Mixkit 45552 + FluidR3 Db/Eb",
  },
  "m1-l3-fingers-3": {
    id: "m1-l3-fingers-3",
    base: "/lessons/demos/m1-l3-fingers-3",
    titleTr: "2–3–4 · üç siyah tuş",
    sourceNote: "Mixkit 45551 high-angle + FluidR3 Gb/Ab/Bb",
  },
  "m1-l4-middle-c": {
    id: "m1-l4-middle-c",
    base: "/lessons/demos/m1-l4-middle-c",
    titleTr: "Orta Do · iki siyahın solu",
    sourceNote: "Mixkit 45552 + FluidR3 C4",
  },
  "m1-l5-five-finger": {
    id: "m1-l5-five-finger",
    base: "/lessons/demos/m1-l5-five-finger",
    titleTr: "Do pozisyonu · 1–5 yürüyüş",
    sourceNote: "Mixkit 46734 + FluidR3 C–G",
  },
  "m1-l5-drm": {
    id: "m1-l5-drm",
    base: "/lessons/demos/m1-l5-drm",
    titleTr: "Do Re Mi · parmak iniş noktaları",
    sourceNote: "Pexels 5390438 + FluidR3 C–D–E",
  },
  "m1-l6-gate": {
    id: "m1-l6-gate",
    base: "/lessons/demos/m1-l6-gate",
    titleTr: "Kapı · Do–Re–Mi–Re–Do",
    sourceNote: "Mixkit 45552 + FluidR3 C–D–E–D–C",
  },
  "m2-l1-fingers": {
    id: "m2-l1-fingers",
    base: "/lessons/demos/m2-l1-fingers",
    titleTr: "Parmak 1–5 · sessiz göster",
    sourceNote: "Mixkit 45552 top-down",
  },
  "m2-l1-do-link": {
    id: "m2-l1-do-link",
    base: "/lessons/demos/m2-l1-do-link",
    titleTr: "Orta Do · tuşta işaret",
    sourceNote: "Mixkit 46734 + FluidR3 C4",
  },
  "m2-l2-middle-c": {
    id: "m2-l2-middle-c",
    base: "/lessons/demos/m2-l2-middle-c",
    titleTr: "Orta Do · porte ↔ tuş",
    sourceNote: "Mixkit 45552 + FluidR3 C4",
  },
  "m2-l2-duration": {
    id: "m2-l2-duration",
    base: "/lessons/demos/m2-l2-duration",
    titleTr: "Kısa Do · uzun Do",
    sourceNote: "Pexels 5390438 + FluidR3 C4 short/long",
  },
  "m2-l2-drm": {
    id: "m2-l2-drm",
    base: "/lessons/demos/m2-l2-drm",
    titleTr: "Do Re Mi · kısa notalar",
    sourceNote: "Mixkit 45551 + FluidR3 C–D–E",
  },
  "m2-l3-re": {
    id: "m2-l3-re",
    base: "/lessons/demos/m2-l3-re",
    titleTr: "Re · Do’nun bir üstü",
    sourceNote: "Mixkit 45552 + FluidR3 C/D",
  },
  "m2-l3-si": {
    id: "m2-l3-si",
    base: "/lessons/demos/m2-l3-si",
    titleTr: "Si · Do’nun altı",
    sourceNote: "Mixkit 46734 + FluidR3 C/B3",
  },
  "m2-l4-mi": {
    id: "m2-l4-mi",
    base: "/lessons/demos/m2-l4-mi",
    titleTr: "Mi · 1 ve 3. parmak",
    sourceNote: "Pexels 5390438 + FluidR3 C/E",
  },
  "m2-l4-la": {
    id: "m2-l4-la",
    base: "/lessons/demos/m2-l4-la",
    titleTr: "La · Mi’nin üstü",
    sourceNote: "Mixkit 45552 + FluidR3 E/A",
  },
  "m2-l5-fa-sol": {
    id: "m2-l5-fa-sol",
    base: "/lessons/demos/m2-l5-fa-sol",
    titleTr: "Fa ve Sol · 4 ve 5",
    sourceNote: "Mixkit 46734 + FluidR3 C–G / F–G",
  },
  "m2-l5-do-sol": {
    id: "m2-l5-do-sol",
    base: "/lessons/demos/m2-l5-do-sol",
    titleTr: "Do–Sol çıkış–iniş",
    sourceNote: "Mixkit 45551 + FluidR3 C–G",
  },
  "m2-l6-gate": {
    id: "m2-l6-gate",
    base: "/lessons/demos/m2-l6-gate",
    titleTr: "Kapı · Do–Sol + süre",
    sourceNote: "Mixkit 45552 + FluidR3 motif",
  },
};

export function demoMeta(id: string | undefined | null): LessonDemoMeta | null {
  if (!id) return null;
  return LESSON_DEMOS[id] ?? null;
}
