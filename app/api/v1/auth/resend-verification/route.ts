import { z } from "zod";
import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { createVerificationCode, hashToken, normalizeEmail } from "@/lib/server/auth";
import { sendVerificationEmail } from "@/lib/server/email";
import { rejectUntrustedOrigin } from "@/lib/server/request-security";

export const runtime = "nodejs";

const resendSchema = z.object({ email: z.string().trim().email().max(320) });
const RESEND_COOLDOWN_MS = 60_000;

export async function POST(request: Request) {
  const originError = rejectUntrustedOrigin(request);
  if (originError) return originError;

  const parsed = resendSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("VALIDATION_ERROR", "Enter a valid email address.", 400);

  try {
    const user = await db.user.findUnique({ where: { emailNormalized: normalizeEmail(parsed.data.email) } });
    if (!user || user.status !== "ACTIVE" || user.emailVerifiedAt) return jsonData({ accepted: true });

    const latestToken = await db.authToken.findFirst({
      where: { userId: user.id, purpose: "EMAIL_VERIFICATION", consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
    const retryAfterMs = latestToken ? RESEND_COOLDOWN_MS - (Date.now() - latestToken.createdAt.getTime()) : 0;
    if (retryAfterMs > 0) return jsonData({ accepted: true, resendAfterSeconds: Math.ceil(retryAfterMs / 1000) });

    const code = createVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await db.authToken.updateMany({
      where: { userId: user.id, purpose: "EMAIL_VERIFICATION", consumedAt: null },
      data: { consumedAt: new Date() },
    });
    await db.authToken.create({
      data: { userId: user.id, tokenHash: hashToken(code), purpose: "EMAIL_VERIFICATION", expiresAt },
    });

    await sendVerificationEmail({ to: user.emailNormalized, displayName: user.displayName, code });
    return jsonData({ accepted: true, resendAfterSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000) });
  } catch (error) {
    console.error("auth.resend_verification.failed", error);
    return jsonError("AUTH_SERVICE_UNAVAILABLE", "We could not resend the verification code. Please try again shortly.", 503);
  }
}
