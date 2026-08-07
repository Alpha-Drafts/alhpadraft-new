/**
 * Server-only session verification for Next.js API routes (the
 * `firebase-decopling` migration removed firebase-admin).
 *
 * The backend signs access JWTs with HS256 using the same secret/issuer/
 * audience configured server-side here (JWT_SECRET, issuer "alphadrafts",
 * audience "alphadrafts-api"). This helper verifies the `access_token`
 * httpOnly cookie without any Firebase dependency.
 *
 * NOTE: JWT_SECRET must be available to the Next.js server (NOT prefixed
 * with NEXT_PUBLIC_).
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextApiRequest } from "next";

const ISSUER = "alphadrafts";
const AUDIENCE = "alphadrafts-api";
export const ACCESS_TOKEN_COOKIE = "access_token";

export interface ServerSession {
  uid: string;
  email: string;
  fullName: string;
  roles: string[];
}

const base64UrlDecode = (input: string): Buffer => {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  return Buffer.from(padded, "base64");
};

const safeEqual = (a: Buffer, b: Buffer): boolean => {
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
};

/** Verifies the access_token cookie; returns session claims or null. */
export function verifyAccessCookie(req: NextApiRequest): ServerSession | null {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not set — cannot verify session cookie");
    return null;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    const expectedSignature = createHmac("sha256", secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest();
    const providedSignature = base64UrlDecode(signatureB64);
    if (!safeEqual(expectedSignature, providedSignature)) return null;

    const payload = JSON.parse(
      base64UrlDecode(payloadB64).toString("utf8"),
    ) as Record<string, unknown>;

    if (payload.iss !== ISSUER || payload.aud !== AUDIENCE) return null;

    const exp = Number(payload.exp ?? 0);
    if (!exp || exp * 1000 < Date.now()) return null;

    const uid = (payload.sub as string) ?? "";
    if (!uid) return null;

    return {
      uid,
      email: (payload.email as string) ?? "",
      fullName: (payload.fullName as string) ?? "",
      roles: Array.isArray(payload.roles) ? (payload.roles as string[]) : [],
    };
  } catch (error) {
    console.error("Session cookie verification failed:", error);
    return null;
  }
}
