-- SoundTeacher / SoungTeacher — Postgres schema draft (Dilim A)
-- Empty / skeletal tables aligned with mvp-teknik-mimari.md §4.
-- Not applied automatically; no live DB required to run the app.

-- Extensions (optional when applying)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "User" (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  "displayName"   TEXT,
  band            TEXT CHECK (band IS NULL OR band IN ('child', 'teen', 'adult')),
  level           TEXT CHECK (level IS NULL OR level IN ('A0', 'A1', 'A2', 'B1')),
  "placementComplete" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Subscription" (
  id                  TEXT PRIMARY KEY,
  "userId"            TEXT NOT NULL UNIQUE REFERENCES "User" (id) ON DELETE CASCADE,
  plan                TEXT NOT NULL CHECK (plan IN ('trial', 'monthly', 'yearly')),
  status              TEXT NOT NULL CHECK (status IN ('trial', 'active', 'past_due', 'canceled')),
  "periodStart"       TIMESTAMPTZ,
  "periodEnd"         TIMESTAMPTZ,
  "stripeCustomerId"  TEXT,
  "stripeSubId"       TEXT,
  "instrumentAccess"  TEXT NOT NULL DEFAULT 'piano',
  "quotaMethod1"      INTEGER NOT NULL DEFAULT 0,
  "quotaMethod1Limit" INTEGER,
  "quotaMethod2"      INTEGER NOT NULL DEFAULT 0,
  "quotaMethod2Limit" INTEGER,
  "moduleAccessPolicy" TEXT NOT NULL DEFAULT 'strict_sequence',
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Path" (
  id                      TEXT PRIMARY KEY,
  "userId"                TEXT NOT NULL UNIQUE REFERENCES "User" (id) ON DELETE CASCADE,
  band                    TEXT NOT NULL CHECK (band IN ('child', 'teen', 'adult')),
  level                   TEXT NOT NULL CHECK (level IN ('A0', 'A1', 'A2', 'B1')),
  "moduleEntry"           INTEGER NOT NULL CHECK ("moduleEntry" BETWEEN 1 AND 7),
  "defaultSessionMinutes" INTEGER NOT NULL,
  "openLessonId"          TEXT,
  "completedLessonIds"    TEXT[] NOT NULL DEFAULT '{}',
  "injectedMicroLessons"  TEXT[] DEFAULT '{}',
  "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "LessonProgress" (
  id          TEXT PRIMARY KEY,
  "userId"    TEXT NOT NULL REFERENCES "User" (id) ON DELETE CASCADE,
  "lessonId"  TEXT NOT NULL,
  phase       TEXT NOT NULL CHECK (phase IN ('theory', 'practice', 'listening', 'gate')),
  status      TEXT NOT NULL CHECK (status IN ('in_progress', 'passed', 'failed_gate')),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId", "lessonId")
);

CREATE TABLE IF NOT EXISTS "Attempt" (
  id                TEXT PRIMARY KEY,
  "userId"          TEXT NOT NULL REFERENCES "User" (id) ON DELETE CASCADE,
  "lessonId"        TEXT NOT NULL,
  method            TEXT NOT NULL CHECK (method IN ('1', '2', '3')),
  "startedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "endedAt"         TIMESTAMPTZ,
  valid             BOOLEAN NOT NULL DEFAULT FALSE,
  "invalidReason"   TEXT,
  "scoreSummary"    JSONB,
  "errorSpans"      JSONB,
  "audioObjectKey"  TEXT,
  "quotaConsumed"   BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "GateResult" (
  id            TEXT PRIMARY KEY,
  "attemptId"   TEXT NOT NULL UNIQUE REFERENCES "Attempt" (id) ON DELETE CASCADE,
  "lessonId"    TEXT NOT NULL,
  "userId"      TEXT NOT NULL REFERENCES "User" (id) ON DELETE CASCADE,
  result        TEXT NOT NULL CHECK (result IN ('pass', 'fail')),
  tolerances    JSONB,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attempt_user_lesson ON "Attempt" ("userId", "lessonId");
CREATE INDEX IF NOT EXISTS idx_gate_user_lesson ON "GateResult" ("userId", "lessonId");
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON "LessonProgress" ("userId");
