import { z } from "zod";
import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { hashToken } from "@/lib/server/auth";
import { hashPassword } from "@/lib/server/password";

export const runtime = "nodejs";

const resetSchema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const parsed = resetSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("VALIDATION_ERROR", "Use a valid reset token and password.", 400);

  const token = await db.authToken.findFirst({
    where: {
      tokenHash: hashToken(parsed.data.token),
      purpose: "PASSWORD_RESET",
      consumedAt: null,
      expiresAt: { gt: new Date() },
      attemptCount: { lt: 5 },
    },
  });
  if (!token) return jsonError("INVALID_RESET_TOKEN", "The reset link is invalid or expired.", 400);

  const passwordHash = await hashPassword(parsed.data.password);
  await db.user.update({ where: { id: token.userId }, data: { passwordHash, requirePasswordChange: false } });
  await db.authToken.update({ where: { id: token.id }, data: { consumedAt: new Date() } });
  await db.userSession.updateMany({ where: { userId: token.userId, revokedAt: null }, data: { revokedAt: new Date() } });

  return jsonData({ reset: true });
}
