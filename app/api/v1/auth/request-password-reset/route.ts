import { z } from "zod";
import { db } from "@/lib/db";
import { jsonData } from "@/lib/server/api";
import { createOpaqueToken, hashToken, normalizeEmail } from "@/lib/server/auth";
import { sendPasswordResetEmail } from "@/lib/server/email";

export const runtime = "nodejs";

const requestSchema = z.object({ email: z.string().trim().email().max(320) });

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonData({ accepted: true });

  const user = await db.user.findUnique({ where: { emailNormalized: normalizeEmail(parsed.data.email) } });
  if (!user || user.status !== "ACTIVE") return jsonData({ accepted: true });

  const token = createOpaqueToken();
  await db.authToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      purpose: "PASSWORD_RESET",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  try {
    await sendPasswordResetEmail({ to: user.emailNormalized, displayName: user.displayName, token });
  } catch {
    return jsonData({ accepted: true });
  }

  return jsonData({ accepted: true });
}
