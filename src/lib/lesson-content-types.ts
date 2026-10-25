import type { Band } from "./bands";

export type ListeningMethod = "1" | "2";

export type BandedText = Record<Band, string>;

export type LessonContent = {
  id: string;
  /** Dilim G — MusicXML / score stub id. */
  scoreRef: string;
  goals: BandedText;
  theoryBubbles: BandedText[];
  practiceSteps: BandedText[];
  practiceBubbles: BandedText[];
  recommendedMethod: ListeningMethod;
  allowedMethods: ListeningMethod[];
  listeningPrep: BandedText;
  mockFeedback: BandedText;
  gatePassBubbles: BandedText[];
  gateFailBubbles: BandedText[];
  failMicroTarget: BandedText;
};
