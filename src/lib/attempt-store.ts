/**
 * Attempt + GateResult store — durable via lesson-session-store (JWT cookie).
 * Survives Vercel serverless cold starts after /api/listening/analyze.
 */

export {
  saveAttempt,
  saveAttemptInMemory,
  getAttempt,
  getLastAttemptForLesson,
  saveGateResult,
  getGateByAttempt,
  persistLessonSessionOnResponse,
} from "./lesson-session-store";
