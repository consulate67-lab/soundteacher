/**
 * Dilim B mock user registry.
 * Stable user ids from email (HMAC/hash) so serverless cold starts don't mint
 * a new id on re-login and orphan Path cookies.
 */

import { createHash } from "crypto";

export type MockUser = {
  id: string;
  email: string;
  password: string;
  displayName: string | null;
  createdAt: string;
};

type Store = Map<string, MockUser>;

const globalForUsers = globalThis as unknown as {
  __soundteacherUsers?: Store;
};

function store(): Store {
  if (!globalForUsers.__soundteacherUsers) {
    globalForUsers.__soundteacherUsers = new Map();
  }
  return globalForUsers.__soundteacherUsers;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Deterministic id — same email → same userId across cold starts. */
export function stableUserIdFromEmail(email: string): string {
  const digest = createHash("sha256")
    .update(`soundteacher:${normalizeEmail(email)}`)
    .digest("hex")
    .slice(0, 16);
  return `usr_${digest}`;
}

export function findUserByEmail(email: string): MockUser | undefined {
  return store().get(normalizeEmail(email));
}

export function findUserById(id: string): MockUser | undefined {
  for (const user of store().values()) {
    if (user.id === id) return user;
  }
  return undefined;
}

export function upsertMockUser(input: {
  email: string;
  password: string;
  displayName?: string | null;
}): MockUser {
  const email = normalizeEmail(input.email);
  const existing = store().get(email);
  if (existing) {
    const updated: MockUser = {
      ...existing,
      // Keep stable id even if older records had random ids
      id: existing.id.startsWith("usr_")
        ? existing.id
        : stableUserIdFromEmail(email),
      password: input.password,
      displayName: input.displayName ?? existing.displayName,
    };
    store().set(email, updated);
    return updated;
  }
  const user: MockUser = {
    id: stableUserIdFromEmail(email),
    email,
    password: input.password,
    displayName: input.displayName?.trim() || null,
    createdAt: new Date().toISOString(),
  };
  store().set(email, user);
  return user;
}
