import { z } from "zod";
import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";
import { rejectUntrustedOrigin } from "@/lib/server/request-security";
import { deletePrivateObject } from "@/lib/server/storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resumeId: string }> },
) {
  const originError = rejectUntrustedOrigin(_request);
  if (originError) return originError;

  const user = await getCurrentUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);

  const parsed = z.string().uuid().safeParse((await params).resumeId);
  if (!parsed.success) return jsonError("INVALID_RESUME_ID", "The resume identifier is invalid.", 400);

  const resume = await db.resume.findFirst({
    where: { id: parsed.data, ownerUserId: user.id, deletedAt: null },
    include: {
      mediaAsset: { select: { mimeType: true, sizeBytes: true } },
      analyses: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!resume) return jsonError("RESUME_NOT_FOUND", "Resume not found.", 404);

  const analysis = resume.analyses[0] ?? null;
  return jsonData({
    resume: {
      id: resume.id,
      fileName: resume.fileName,
      status: resume.status,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
      retentionUntil: resume.retentionUntil,
      mimeType: resume.mediaAsset.mimeType,
      sizeBytes: Number(resume.mediaAsset.sizeBytes),
    },
    analysis: analysis
      ? {
          id: analysis.id,
          provider: analysis.provider,
          model: analysis.model,
          promptVersion: analysis.promptVersion,
          status: analysis.status,
          atsScore: analysis.atsScore,
          overallScore: analysis.overallScore,
          jobFitScore: analysis.jobFitScore,
          summary: analysis.summary,
          report: analysis.reportJson,
          wordCount: analysis.wordCount,
          pageCount: analysis.pageCount,
          attempt: analysis.attempt,
          errorCode: analysis.errorCode,
          errorMessage: analysis.errorMessage,
          startedAt: analysis.startedAt,
          completedAt: analysis.completedAt,
        }
      : null,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ resumeId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);

  const parsed = z.string().uuid().safeParse((await params).resumeId);
  if (!parsed.success) return jsonError("INVALID_RESUME_ID", "The resume identifier is invalid.", 400);

  const resume = await db.resume.findFirst({
    where: { id: parsed.data, ownerUserId: user.id, deletedAt: null },
    include: { mediaAsset: true },
  });
  if (!resume) return jsonError("RESUME_NOT_FOUND", "Resume not found.", 404);

  const deletedAt = new Date();
  await db.resume.update({
    where: { id: resume.id },
    data: { status: "DELETED", deletedAt },
  });
  await db.mediaAsset.update({
    where: { id: resume.mediaAssetId },
    data: { status: "DELETED", deletedAt, deletionReason: "USER_REQUEST" },
  });
  await db.job.create({
    data: {
      type: "MEDIA_DELETE",
      payload: { mediaAssetId: resume.mediaAssetId, storageKey: resume.mediaAsset.storageKey },
      idempotencyKey: `media-delete:${resume.mediaAssetId}`,
      status: "queued",
      createdById: user.id,
    },
  });
  await db.auditLog.create({
    data: {
      actorUserId: user.id,
      actorRole: user.role,
      action: "RESUME_DELETED",
      entityType: "RESUME",
      entityId: resume.id,
      details: { deletionReason: "USER_REQUEST" },
    },
  });

  let storageDeletion = "queued";
  try {
    await deletePrivateObject(resume.mediaAsset.storageKey);
    storageDeletion = "completed";
    await db.job.update({
      where: { idempotencyKey: `media-delete:${resume.mediaAssetId}` },
      data: { status: "completed", completedAt: new Date() },
    });
  } catch (error) {
    console.error("resume.delete.storage_failed", error);
  }

  return jsonData({ deleted: true, storageDeletion }, 202);
}
