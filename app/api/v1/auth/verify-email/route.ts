import { z } from "zod";
import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { createSession, hashToken, normalizeEmail, publicUser } from "@/lib/server/auth";
import { rejectUntrustedOrigin } from "@/lib/server/request-security";

export const runtime = "nodejs";

const verifySchema = z.object({
  email: z.string().trim().email().max(320),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(request: Request) {
  const originError = rejectUntrustedOrigin(request);
  if (originError) return originError;
  const parsed = verifySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("VALIDATION_ERROR", "Enter the six-digit verification code.", 400);

  try {
    const email = normalizeEmail(parsed.data.email);
    const user = await db.user.findUnique({ where: { emailNormalized: email } });
    if (!user) return jsonError("INVALID_VERIFICATION", "The verification code is invalid or expired.", 400);

    const token = await db.authToken.findFirst({
      where: {
        userId: user.id,
        purpose: "EMAIL_VERIFICATION",
        tokenHash: hashToken(parsed.data.code),
        consumedAt: null,
        expiresAt: { gt: new Date() },
        attemptCount: { lt: 5 },
      },
    });

    if (!token) {
      await db.authToken.updateMany({
        where: { userId: user.id, purpose: "EMAIL_VERIFICATION", consumedAt: null },
        data: { attemptCount: { increment: 1 } },
      });
      return jsonError("INVALID_VERIFICATION", "The verification code is invalid or expired.", 400);
    }

    await db.authToken.update({ where: { id: token.id }, data: { consumedAt: new Date() } });
    const verified = await db.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });

    await createSession(verified.id);
    return jsonData({ user: publicUser(verified), verified: true });
  } catch (error) {
    console.error("auth.verify_email.failed", error);
    return jsonError("AUTH_SERVICE_UNAVAILABLE", "Email verification is temporarily unavailable. Please try again shortly.", 503);
  }
}
