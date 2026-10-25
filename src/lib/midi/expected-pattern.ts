/**
 * Demo expected pitch classes (C=0 … B=11) for Method 3 alignment.
 * Real MusicXML later — this is a deterministic teaching stub.
 */

export type ExpectedPattern = {
  /** Pitch classes in order (repeats allowed). */
  pitchClasses: number[];
  label: string;
};

/** C4–G4 white keys as pitch classes: Do Re Mi Fa Sol = 0 2 4 5 7; Si=11; La=9 */
const DO_SOL = [0, 2, 4, 5, 7];
const DO_RE_MI = [0, 2, 4];
const DO_ONLY = [0];
const DO_RE_SI = [0, 2, 11, 0];
const MI_LA = [4, 9, 4, 0];

export function expectedPatternForLesson(lessonId: string): ExpectedPattern {
  if (lessonId === "piano.m1.l5" || lessonId === "piano.m1.l6") {
    return { pitchClasses: DO_SOL, label: "Do–Sol" };
  }
  if (lessonId === "piano.m2.l2") {
    return { pitchClasses: DO_ONLY.concat(DO_RE_MI), label: "Do + süre / Do–Re–Mi" };
  }
  if (lessonId === "piano.m2.l3") {
    return { pitchClasses: DO_RE_SI, label: "Do–Re–Si" };
  }
  if (lessonId === "piano.m2.l4") {
    return { pitchClasses: MI_LA, label: "Mi–La" };
  }
  if (lessonId === "piano.m2.l5" || lessonId === "piano.m2.l6") {
    return { pitchClasses: DO_SOL, label: "Do–Sol" };
  }
  if (lessonId.startsWith("piano.m3.")) {
    return { pitchClasses: DO_SOL, label: "Do–Sol (iki el)" };
  }
  return { pitchClasses: DO_ONLY.concat(DO_RE_MI), label: "Do–Re–Mi" };
}
