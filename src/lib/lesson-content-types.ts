import type { Band } from "./bands";

export type ListeningMethod = "1" | "2" | "3";

export type BandedText = Record<Band, string>;

/** Opt-in legacy practice diagram (posture film). Prefer step `demo` ids. */
export type PracticeVisual = "posture-hands" | "none";

/** Theory/practice step with optional real-hand demo clip id (`lesson-demos.ts`). */
export type TeachingStep = BandedText & {
  /** Registry id → `/lessons/demos/{id}.mp4` */
  demo?: string;
};

export type LessonContent = {
  id: string;
  /** Dilim G — MusicXML / score stub id. */
  scoreRef: string;
  goals: BandedText;
  theoryBubbles: BandedText[];
  /** Short numbered “what to do” coaching for the student. */
  theorySteps?: TeachingStep[];
  practiceSteps: TeachingStep[];
  practiceBubbles: BandedText[];
  /** Animated diagram during practice. Default: none. */
  practiceVisual?: PracticeVisual;
  /**
   * If false, skip Dinleme / MediaRecorder — practice → self-check → Kapı.
   * Default: true (Y1/Y2 required).
   */
  listeningRequired?: boolean;
  recommendedMethod: ListeningMethod;
  allowedMethods: ListeningMethod[];
  listeningPrep: BandedText;
  mockFeedback: BandedText;
  gatePassBubbles: BandedText[];
  gateFailBubbles: BandedText[];
  failMicroTarget: BandedText;
  /** Self-check prompts when listeningRequired is false. */
  selfCheckPrompt?: BandedText;
};

export function isListeningRequired(content: LessonContent): boolean {
  return content.listeningRequired !== false;
}

export function practiceVisualOf(content: LessonContent): PracticeVisual {
  return content.practiceVisual ?? "none";
}
