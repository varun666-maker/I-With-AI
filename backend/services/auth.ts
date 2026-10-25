import { createHash, randomBytes, randomInt } from "node:crypto";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "interviewai_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

export function createVerificationCode(): string {
  return String(randomInt(100000, 1000000));
}

export async function createSession(userId: string): Promise<void> {
  const token = createOpaqueToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);
  const requestHeaders = await headers();

  await db.userSession.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      ipHash: hashToken(requestHeaders.get("x-forwarded-for") ?? "unknown"),
      userAgentHash: hashToken(requestHeaders.get("user-agent") ?? "unknown"),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.userSession.findFirst({
    where: {
      tokenHash: hashToken(token),
      revokedAt: null,
      expiresAt: { gt: new Date() },
      user: { status: "ACTIVE" },
    },
    include: { user: true },
  });

  if (!session) return null;

  await db.userSession.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() },
  });

  return session.user;
}

export async function revokeCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.userSession.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function publicUser(user: {
  id: string;
  emailNormalized: string;
  displayName: string;
  role: string;
  status: string;
  emailVerifiedAt: Date | null;
  requirePasswordChange: boolean;
}) {
  return {
    id: user.id,
    email: user.emailNormalized,
    displayName: user.displayName,
    role: user.role.toLowerCase(),
    status: user.status.toLowerCase(),
    emailVerified: Boolean(user.emailVerifiedAt),
    requirePasswordChange: user.requirePasswordChange,
  };
}
