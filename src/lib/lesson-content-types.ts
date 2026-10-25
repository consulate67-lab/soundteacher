import type { Band } from "./bands";

export type ListeningMethod = "1" | "2" | "3";

export type BandedText = Record<Band, string>;

/** Opt-in practice diagrams (CSS/SVG — no heavy assets). */
export type PracticeVisual = "posture-hands" | "none";

export type LessonContent = {
  id: string;
  /** Dilim G — MusicXML / score stub id. */
  scoreRef: string;
  goals: BandedText;
  theoryBubbles: BandedText[];
  /** Short numbered “what to do” coaching for the student. */
  theorySteps?: BandedText[];
  practiceSteps: BandedText[];
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
