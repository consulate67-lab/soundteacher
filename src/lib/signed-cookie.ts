import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

/**
 * Durable MVP state via JWT cookies (HS256 / jose).
 * Survives Vercel serverless cold starts — no DB required.
 */

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 180;

function secretKey(): Uint8Array {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "dev-only-soundteacher-auth-secret",
  );
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

export async function sealJwt(
  value: Record<string, unknown>,
  maxAgeSec = DEFAULT_MAX_AGE,
): Promise<string> {
  return new SignJWT(value)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSec}s`)
    .sign(secretKey());
}

export async function unsealJwt<T extends Record<string, unknown>>(
  token: string | undefined | null,
): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as T;
  } catch {
    return null;
  }
}

export async function readSignedCookie<T extends Record<string, unknown>>(
  name: string,
): Promise<T | null> {
  const jar = await cookies();
  return unsealJwt<T>(jar.get(name)?.value);
}

export async function writeSignedCookie(
  name: string,
  value: Record<string, unknown>,
  maxAgeSec = DEFAULT_MAX_AGE,
): Promise<void> {
  const jar = await cookies();
  jar.set(name, await sealJwt(value, maxAgeSec), signedCookieOptions(maxAgeSec));
}

/** Prefer this in Route Handlers — Set-Cookie is attached to the response. */
export async function setSignedCookieOnResponse(
  response: NextResponse,
  name: string,
  value: Record<string, unknown>,
  maxAgeSec = DEFAULT_MAX_AGE,
): Promise<void> {
  response.cookies.set(
    name,
    await sealJwt(value, maxAgeSec),
    signedCookieOptions(maxAgeSec),
  );
}

export function clearSignedCookieOnResponse(
  response: NextResponse,
  name: string,
): void {
  response.cookies.set(name, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function clearSignedCookie(name: string): Promise<void> {
  const jar = await cookies();
  jar.set(name, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}
