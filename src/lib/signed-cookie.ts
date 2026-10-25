import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

/**
 * Signed cookie helpers for serverless-durable MVP state (no DB yet).
 * Payload = base64url(JSON) + "." + HMAC-SHA256(base64url).
 */

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 180;

function secret(): string {
  return process.env.AUTH_SECRET || "dev-only-soundteacher-auth-secret";
}

function b64url(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf, "utf8") : buf;
  return b.toString("base64url");
}

function signPayload(payloadB64: string): string {
  return createHmac("sha256", secret()).update(payloadB64).digest("base64url");
}

export function sealJson(value: unknown): string {
  const payloadB64 = b64url(JSON.stringify(value));
  return `${payloadB64}.${signPayload(payloadB64)}`;
}

export function unsealJson<T>(token: string | undefined | null): T | null {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i <= 0) return null;
  const payloadB64 = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = signPayload(payloadB64);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function signedCookieOptions(maxAgeSec = DEFAULT_MAX_AGE) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSec,
  };
}

export async function readSignedCookie<T>(name: string): Promise<T | null> {
  const jar = await cookies();
  return unsealJson<T>(jar.get(name)?.value);
}

export async function writeSignedCookie(
  name: string,
  value: unknown,
  maxAgeSec = DEFAULT_MAX_AGE,
): Promise<void> {
  const jar = await cookies();
  jar.set(name, sealJson(value), signedCookieOptions(maxAgeSec));
}

/** Attach on NextResponse so Set-Cookie is guaranteed on Route Handler replies. */
export function setSignedCookieOnResponse(
  response: NextResponse,
  name: string,
  value: unknown,
  maxAgeSec = DEFAULT_MAX_AGE,
): void {
  response.cookies.set(name, sealJson(value), signedCookieOptions(maxAgeSec));
}

export function clearSignedCookieOnResponse(
  response: NextResponse,
  name: string,
): void {
  response.cookies.set(name, "", { ...signedCookieOptions(0), maxAge: 0 });
}

export async function clearSignedCookie(name: string): Promise<void> {
  const jar = await cookies();
  jar.delete(name);
}
