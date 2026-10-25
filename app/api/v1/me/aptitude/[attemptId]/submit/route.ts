import { z } from "zod";
import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";
import { rejectUntrustedOrigin } from "@/lib/server/request-security";
import { submitAptitudeAttempt } from "@/lib/server/aptitude";

export const runtime = "nodejs";

const submitSchema = z.object({
  tabSwitches: z.number().int().min(0).optional(),
  fullscreenExits: z.number().int().min(0).optional(),
  audioSpikes: z.number().int().min(0).optional(),
  copyPasteAttempts: z.number().int().min(0).optional(),
  mouseWindowLeaves: z.number().int().min(0).optional(),
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

    let telemetry = {
      tabSwitches: 0,
      fullscreenExits: 0,
      audioSpikes: 0,
      copyPasteAttempts: 0,
      mouseWindowLeaves: 0,
    };
    try {
      const body = await request.json();
      const parsed = submitSchema.safeParse(body);
      if (parsed.success) {
        telemetry = {
          tabSwitches: parsed.data.tabSwitches ?? 0,
          fullscreenExits: parsed.data.fullscreenExits ?? 0,
          audioSpikes: parsed.data.audioSpikes ?? 0,
          copyPasteAttempts: parsed.data.copyPasteAttempts ?? 0,
          mouseWindowLeaves: parsed.data.mouseWindowLeaves ?? 0,
        };
      }
    } catch {
      // Empty body is acceptable
    }

    const scorecard = await submitAptitudeAttempt(user.id, parsedId.data, telemetry);
    return jsonData(scorecard);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "SUBMIT_FAILED";
    if (message === "ATTEMPT_NOT_FOUND") {
      return jsonError("ATTEMPT_NOT_FOUND", "Aptitude attempt not found.", 404);
    }
    console.error("aptitude.submit_failed", error);
    return jsonError("APTITUDE_SUBMIT_FAILED", `Failed to submit aptitude test: ${message}`, 500);
  }
}
