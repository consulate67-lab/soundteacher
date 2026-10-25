/**
 * Dilim D/E — lesson phase state (durable cookie via lesson-session-store).
 */

export type LessonPhase =
  | "theory"
  | "practice"
  | "listening"
  | "feedback"
  | "gate_pass"
  | "gate_fail"
  | "unlock";

export type LessonProgressRecord = {
  userId: string;
  lessonId: string;
  phase: LessonPhase;
  status: "in_progress" | "passed" | "failed_gate";
  attemptCount: number;
  lastAttemptId: string | null;
  lastGateResult: "pass" | "fail" | null;
  updatedAt: string;
};

export {
  ensureLessonProgress,
  getLessonProgress,
  setLessonPhase,
  resetLessonToPractice,
  resetLessonToListening,
} from "./lesson-session-store";
