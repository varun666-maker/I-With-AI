import { z } from "zod";
import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { createSession, normalizeEmail, publicUser } from "@/lib/server/auth";
import { verifyPassword } from "@/lib/server/password";
import { rejectUntrustedOrigin } from "@/lib/server/request-security";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  const originError = rejectUntrustedOrigin(request);
  if (originError) return originError;
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("VALIDATION_ERROR", "Enter a valid email and password.", 400);

  try {
    const user = await db.user.findUnique({ where: { emailNormalized: normalizeEmail(parsed.data.email) } });
    const passwordMatches = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
    if (!user || !passwordMatches) return jsonError("INVALID_CREDENTIALS", "Email or password is incorrect.", 401);
    if (user.status === "SUSPENDED") return jsonError("ACCOUNT_SUSPENDED", "This account is suspended.", 403);
    if (user.status === "DELETED") return jsonError("ACCOUNT_DELETED", "This account is unavailable.", 403);
    if (!user.emailVerifiedAt) return jsonError("EMAIL_NOT_VERIFIED", "Verify your email before signing in.", 403);

    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await createSession(user.id);
    return jsonData({ user: publicUser(user) });
  } catch (error) {
    console.error("auth.login.database_unavailable", error);
    return jsonError("AUTH_SERVICE_UNAVAILABLE", "Sign-in is temporarily unavailable because the database cannot be reached. Please try again shortly.", 503);
  }
}
