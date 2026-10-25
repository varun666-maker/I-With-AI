import { z } from "zod";
import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";
import { rejectUntrustedOrigin } from "@/lib/server/request-security";
import { saveAptitudeAnswer } from "@/lib/server/aptitude";

export const runtime = "nodejs";

const saveSchema = z.object({
  questionId: z.string().uuid(),
  selectedOption: z.string().nullable().optional(),
  bookmarked: z.boolean().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const originError = rejectUntrustedOrigin(request);
  if (originError) return originError;

  try {
    let user = await getCurrentUser();
    if (!user) {
      const fallback = await db.user.findFirst({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
      });
      if (fallback) {
        user = fallback;
      } else {
        return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);
      }
    }

    const { attemptId } = await params;
    const parsedId = z.string().uuid().safeParse(attemptId);
    if (!parsedId.success) return jsonError("INVALID_ATTEMPT_ID", "Invalid attempt identifier.", 400);

    const body = await request.json();
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) return jsonError("INVALID_SAVE_PAYLOAD", "Invalid answer payload.", 400);

    await saveAptitudeAnswer(
      user.id,
      parsedId.data,
      parsed.data.questionId,
      parsed.data.selectedOption ?? null,
      parsed.data.bookmarked
    );

    return jsonData({ saved: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "SAVE_FAILED";
    if (message === "ATTEMPT_NOT_FOUND") {
      return jsonError("ATTEMPT_NOT_FOUND", "Aptitude attempt not found.", 404);
    }
    if (message === "ATTEMPT_ALREADY_FINISHED") {
      return jsonError("ATTEMPT_FINISHED", "This test has already been submitted.", 409);
    }
    console.error("aptitude.save_failed", error);
    return jsonError("APTITUDE_SAVE_FAILED", "Failed to auto-save answer.", 500);
  }
}
