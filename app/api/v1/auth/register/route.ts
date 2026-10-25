import { z } from "zod";
import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { createVerificationCode, hashToken, normalizeEmail } from "@/lib/server/auth";
import { hashPassword } from "@/lib/server/password";
import { sendVerificationEmail } from "@/lib/server/email";
import { rejectUntrustedOrigin } from "@/lib/server/request-security";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const originError = rejectUntrustedOrigin(request);
  if (originError) return originError;
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("VALIDATION_ERROR", "Check the submitted account details.", 400, parsed.error.flatten());

  const email = normalizeEmail(parsed.data.email);
  let existing;
  try {
    existing = await db.user.findUnique({ where: { emailNormalized: email } });
  } catch (error) {
    console.error("auth.register.database_lookup_failed", error);
    return jsonError("DATABASE_UNAVAILABLE", "Account services are temporarily unavailable. Please try again shortly.", 503);
  }
  if (existing && existing.status !== "DELETED") {
    return jsonError("EMAIL_IN_USE", "An account already exists for this email.", 409);
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const verificationCode = createVerificationCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  let user;
  try {
    user = await db.user.create({
      data: {
        emailNormalized: email,
        passwordHash,
        displayName: parsed.data.name,
        role: "STUDENT",
        profile: { create: {} },
      },
    });

    await db.authToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(verificationCode),
        purpose: "EMAIL_VERIFICATION",
        expiresAt,
      },
    });
  } catch (error) {
    console.error("auth.register.database_create_failed", error);
    return jsonError("DATABASE_UNAVAILABLE", "Account services are temporarily unavailable. Please try again shortly.", 503);
  }

  let emailDeliveryPending = false;
  try {
    await sendVerificationEmail({
      to: user.emailNormalized,
      displayName: user.displayName,
      code: verificationCode,
    });
  } catch {
    emailDeliveryPending = true;
  }

  return jsonData(
    {
      userId: user.id,
      email: user.emailNormalized,
      verificationRequired: true,
      emailDeliveryPending,
    },
    201,
  );
}
