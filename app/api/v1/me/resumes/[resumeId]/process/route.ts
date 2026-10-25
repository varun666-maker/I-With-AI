import { z } from "zod";
import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";
import { rejectUntrustedOrigin } from "@/lib/server/request-security";
import { processNextResumeJob } from "@/lib/server/resume-worker";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ resumeId: string }> },
) {
  const originError = rejectUntrustedOrigin(_request);
  if (originError) return originError;

  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);

    const parsed = z.string().uuid().safeParse((await params).resumeId);
    if (!parsed.success) return jsonError("INVALID_RESUME_ID", "The resume identifier is invalid.", 400);

    const url = new URL(_request.url);
    const force = url.searchParams.get("force") === "true";

    const resume = await db.resume.findFirst({
      where: { id: parsed.data, ownerUserId: user.id, deletedAt: null },
      select: { id: true, status: true },
    });
    if (!resume) return jsonError("RESUME_NOT_FOUND", "Resume not found.", 404);
    if (resume.status === "COMPLETED" && !force) return jsonData({ status: "already_completed", resumeId: resume.id });
    if (resume.status === "DELETED") return jsonError("RESUME_DELETED", "This resume is no longer available.", 410);

    if (force) {
      await db.resume.update({ where: { id: resume.id }, data: { status: "UPLOADED" } });
    }

    const result = await processNextResumeJob(resume.id);
    if (result.status === "completed" || result.status === "already_completed") return jsonData(result);
    if (result.status === "retry_scheduled") {
      return jsonData(
        {
          ...result,
          message: "Analysis did not finish within the time limit. The resume is saved and can be retried.",
        },
        202,
      );
    }
    if (result.status === "failed") {
      return jsonError("RESUME_ANALYSIS_FAILED", "The resume could not be analyzed. Please try again.", 422, {
        resumeId: resume.id,
        errorCode: "errorCode" in result ? result.errorCode : "WORKER_FAILED",
      });
    }
    return jsonError("RESUME_JOB_UNAVAILABLE", "The resume analysis job is not available. Please retry.", 409);
  } catch (error) {
    console.error("resume.process.request_failed", { error });
    return jsonError("RESUME_SERVICE_UNAVAILABLE", "Resume analysis is temporarily unavailable. Please retry shortly.", 503);
  }
}
