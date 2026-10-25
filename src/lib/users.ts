/**
 * Dilim B mock user registry (in-memory).
 * Auth.js Credentials authorize reads/writes here — no live DB yet.
 */

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
      password: input.password,
      displayName: input.displayName ?? existing.displayName,
    };
    store().set(email, updated);
    return updated;
  }
  const user: MockUser = {
    id: `usr_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
    email,
    password: input.password,
    displayName: input.displayName?.trim() || null,
    createdAt: new Date().toISOString(),
  };
  store().set(email, user);
  return user;
}
