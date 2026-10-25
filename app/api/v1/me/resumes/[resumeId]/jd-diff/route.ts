import { z } from "zod";
import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";
import { rejectUntrustedOrigin } from "@/lib/server/request-security";
import { compareResumeWithJobDescription } from "@/lib/server/resume-analysis";

export const runtime = "nodejs";
export const maxDuration = 30;

const jdDiffBodySchema = z.object({
  jobDescription: z.string().trim().min(20, "Job description must be at least 20 characters.").max(15000),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ resumeId: string }> },
) {
  const originError = rejectUntrustedOrigin(request);
  if (originError) return originError;

  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);

    const parsedId = z.string().uuid().safeParse((await params).resumeId);
    if (!parsedId.success) return jsonError("INVALID_RESUME_ID", "The resume identifier is invalid.", 400);

    const body = await request.json().catch(() => null);
    const parsedBody = jdDiffBodySchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonError("VALIDATION_ERROR", "Provide a valid job description (at least 20 characters).", 400, parsedBody.error.flatten());
    }

    const resume = await db.resume.findFirst({
      where: { id: parsedId.data, ownerUserId: user.id, deletedAt: null },
      select: { id: true, extractedText: true, status: true },
    });

    if (!resume) return jsonError("RESUME_NOT_FOUND", "Resume not found.", 404);
    if (!resume.extractedText || resume.extractedText.length < 30) {
      return jsonError("NO_RESUME_TEXT", "This resume does not have extracted text available. Please analyze it first.", 400);
    }

    const diff = await compareResumeWithJobDescription({
      resumeText: resume.extractedText,
      jobDescription: parsedBody.data.jobDescription,
    });

    return jsonData({ diff });
  } catch (error) {
    console.error("resume.jd_diff.failed", error);
    return jsonError("JD_DIFF_FAILED", "Unable to compare with job description right now. Please try again shortly.", 500);
  }
}
