import { z } from "zod";
import { db } from "@/lib/db";
import { analyzeResumeWithGemini } from "@/lib/server/resume-analysis";
import { extractResumeText, ResumeProcessingError } from "@/lib/server/resume-extraction";
import { deletePrivateObject, downloadPrivateObject } from "@/lib/server/storage";
import { createInAppNotification } from "@/lib/server/notifications";

const resumeJobPayload = z.object({
  resumeId: z.string().uuid(),
  userId: z.string().uuid(),
  mediaAssetId: z.string().uuid(),
  analysisId: z.string().uuid().optional(),
});

const mediaDeletePayload = z.object({
  mediaAssetId: z.string().uuid(),
  storageKey: z.string().min(1),
});

function configuredInteger(name: string, fallback: number, minimum: number, maximum: number) {
  const value = Number(process.env[name] ?? fallback);
  return Number.isInteger(value) && value >= minimum && value <= maximum ? value : fallback;
}

function errorDetails(error: unknown) {
  if (error instanceof ResumeProcessingError) {
    return { code: error.code, message: error.message, retryable: error.retryable };
  }
  return { code: "WORKER_FAILED", message: "Resume processing failed.", retryable: true };
}

async function claimNextJob(type: string | string[], idempotencyKey?: string) {
  const staleAt = new Date(Date.now() - configuredInteger("JOB_LOCK_TIMEOUT_SECONDS", 900, 60, 86_400) * 1000);
  await db.job.updateMany({
    where: {
      type: Array.isArray(type) ? { in: type } : type,
      status: "processing",
      lockedAt: { lt: staleAt },
    },
    data: { status: "queued", lockedAt: null, runAfter: new Date() },
  });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidate = await db.job.findFirst({
      where: {
        type: Array.isArray(type) ? { in: type } : type,
        status: "queued",
        ...(idempotencyKey ? {} : { runAfter: { lte: new Date() } }),
        ...(idempotencyKey ? { idempotencyKey } : {}),
      },
      orderBy: [{ runAfter: "asc" }, { createdAt: "asc" }],
    });
    if (!candidate) return null;

    const claimed = await db.job.updateMany({
      where: { id: candidate.id, status: "queued" },
      data: { status: "processing", lockedAt: new Date(), attempts: { increment: 1 } },
    });
    if (claimed.count === 1) return db.job.findUnique({ where: { id: candidate.id } });
  }
  return null;
}

async function failOrRetryResumeJob(input: {
  jobId: string;
  analysisId: string;
  resumeId: string;
  userId: string;
  attempts: number;
  error: unknown;
}) {
  const details = errorDetails(input.error);
  const maxAttempts = configuredInteger("RESUME_MAX_ATTEMPTS", 3, 1, 10);
  const shouldRetry = details.retryable && input.attempts < maxAttempts;
  const retryDelaySeconds = Math.min(600, 30 * 2 ** Math.max(0, input.attempts - 1));
  const runAfter = new Date(Date.now() + retryDelaySeconds * 1000);

  await db.resumeAnalysis.update({
    where: { id: input.analysisId },
    data: {
      status: shouldRetry ? "QUEUED" : "FAILED",
      errorCode: details.code,
      errorMessage: details.message,
      attempt: input.attempts,
      ...(shouldRetry ? {} : { completedAt: null }),
    },
  });
  await db.resume.update({
    where: { id: input.resumeId },
    data: { status: shouldRetry ? "UPLOADED" : "FAILED" },
  });
  await db.job.update({
    where: { id: input.jobId },
    data: {
      status: shouldRetry ? "queued" : "failed",
      lockedAt: null,
      runAfter: shouldRetry ? runAfter : new Date(),
      lastError: `${details.code}: ${details.message}`.slice(0, 1000),
      ...(shouldRetry ? {} : { completedAt: new Date() }),
    },
  });
  if (!shouldRetry) {
    await createInAppNotification(db, {
      userId: input.userId,
      type: "RESUME_ANALYSIS_FAILED",
      payload: {
        title: "Resume analysis failed",
        message: "We could not finish analyzing your resume. You can retry it from Resume Hub.",
        screen: "resume",
        resumeId: input.resumeId,
      },
    });
  }

  return {
    status: shouldRetry ? "retry_scheduled" : "failed",
    jobId: input.jobId,
    attempts: input.attempts,
    ...(shouldRetry ? { retryAt: runAfter } : { errorCode: details.code }),
  };
}

export async function processNextResumeJob(resumeId?: string) {
  if (resumeId) {
    const existingJob = await db.job.findFirst({
      where: { idempotencyKey: `resume-analysis:${resumeId}` },
    });
    if (existingJob) {
      await db.job.update({
        where: { id: existingJob.id },
        data: { status: "queued", lockedAt: null, runAfter: new Date() },
      });
    } else {
      const resume = await db.resume.findUnique({
        where: { id: resumeId },
        include: { analyses: { take: 1, orderBy: { createdAt: "desc" } } },
      });
      if (resume) {
        let analysisId = resume.analyses[0]?.id;
        if (!analysisId) {
          const newAnalysis = await db.resumeAnalysis.create({
            data: {
              resumeId: resume.id,
              provider: "gemini",
              model: "gemini-3-flash-preview",
              promptVersion: "resume-ats-v1",
              status: "QUEUED",
            },
          });
          analysisId = newAnalysis.id;
        }
        await db.job.create({
          data: {
            type: "RESUME_ANALYSIS",
            payload: { resumeId: resume.id, userId: resume.ownerUserId, mediaAssetId: resume.mediaAssetId, analysisId },
            idempotencyKey: `resume-analysis:${resumeId}`,
            status: "queued",
            createdById: resume.ownerUserId,
          },
        });
      }
    }
  }

  const job = await claimNextJob("RESUME_ANALYSIS", resumeId ? `resume-analysis:${resumeId}` : undefined);
  if (!job) return { status: "idle" as const };

  const parsedPayload = resumeJobPayload.safeParse(job.payload);
  if (!parsedPayload.success) {
    await db.job.update({
      where: { id: job.id },
      data: {
        status: "failed",
        lockedAt: null,
        completedAt: new Date(),
        lastError: "INVALID_JOB_PAYLOAD",
      },
    });
    return { status: "failed" as const, jobId: job.id, errorCode: "INVALID_JOB_PAYLOAD" };
  }

  const payload = parsedPayload.data;
  const resume = await db.resume.findFirst({
    where: { id: payload.resumeId, ownerUserId: payload.userId, deletedAt: null },
    include: { mediaAsset: true },
  });
  const locatedAnalysis = payload.analysisId
    ? await db.resumeAnalysis.findUnique({ where: { id: payload.analysisId } })
    : await db.resumeAnalysis.findFirst({ where: { resumeId: payload.resumeId }, orderBy: { createdAt: "desc" } });

  if (!resume) {
    await db.job.update({
      where: { id: job.id },
      data: { status: "failed", lockedAt: null, completedAt: new Date(), lastError: "RESUME_NOT_FOUND" },
    });
    return { status: "failed" as const, jobId: job.id, errorCode: "RESUME_NOT_FOUND" };
  }

  const analysis = locatedAnalysis ?? await db.resumeAnalysis.create({
    data: {
      resumeId: resume.id,
      provider: "gemini",
      model: process.env.GEMINI_RESUME_MODEL ?? "gemini-3-flash-preview",
      promptVersion: "resume-ats-v1",
      status: "QUEUED",
    },
  });

  if (resume.mediaAssetId !== payload.mediaAssetId) {
    return failOrRetryResumeJob({
      jobId: job.id,
      analysisId: analysis?.id ?? z.string().uuid().parse(payload.analysisId),
      resumeId: payload.resumeId,
      userId: payload.userId,
      attempts: job.attempts,
      error: new ResumeProcessingError("RESUME_NOT_FOUND", "The resume or analysis record no longer exists.", false),
    });
  }
  if (analysis.status === "COMPLETED" && resume.status === "COMPLETED") {
    await db.job.update({ where: { id: job.id }, data: { status: "completed", lockedAt: null, completedAt: new Date() } });
    return { status: "already_completed" as const, jobId: job.id };
  }

  await db.resume.update({ where: { id: resume.id }, data: { status: "PROCESSING" } });
  await db.resumeAnalysis.update({
    where: { id: analysis.id },
    data: { status: "PROCESSING", attempt: job.attempts, startedAt: new Date(), errorCode: null, errorMessage: null },
  });

  try {
    let buffer: Buffer;
    try {
      buffer = await downloadPrivateObject(
        resume.mediaAsset.storageKey,
        Number(resume.mediaAsset.sizeBytes),
      );
    } catch (dlErr) {
      console.error("resume.worker.download_failed", dlErr);
      throw new ResumeProcessingError("STORAGE_DOWNLOAD_FAILED", "The private resume file could not be downloaded.");
    }

    const extracted = await extractResumeText({
      buffer,
      mimeType: resume.mediaAsset.mimeType,
      fileName: resume.fileName,
    });
    await db.resume.update({
      where: { id: resume.id },
      data: { extractedText: extracted.text },
    });

    const profile = await db.profile.findUnique({ where: { userId: resume.ownerUserId } });
    const analyzed = await analyzeResumeWithGemini({
      resumeText: extracted.text,
      targetRole: profile?.targetRole,
      experienceLevel: profile?.experienceLevel,
    });

    await db.resumeAnalysis.update({
      where: { id: analysis.id },
      data: {
        status: "COMPLETED",
        model: analyzed.model,
        atsScore: analyzed.report.atsScore,
        overallScore: analyzed.report.overallScore,
        jobFitScore: analyzed.report.jobFitScore,
        summary: analyzed.report.summary,
        reportJson: analyzed.report,
        wordCount: extracted.wordCount,
        pageCount: extracted.pageCount,
        attempt: job.attempts,
        errorCode: null,
        errorMessage: null,
        completedAt: new Date(),
      },
    });
    await db.resume.update({ where: { id: resume.id }, data: { status: "COMPLETED" } });
    await db.job.update({ where: { id: job.id }, data: { status: "completed", lockedAt: null, completedAt: new Date(), lastError: null } });
    await db.auditLog.create({
      data: {
        actorUserId: resume.ownerUserId,
        actorRole: "SYSTEM_WORKER",
        action: "RESUME_ANALYZED",
        entityType: "RESUME_ANALYSIS",
        entityId: analysis.id,
        details: { provider: "gemini", model: analyzed.model, attempts: job.attempts },
      },
    });
    const notification = await createInAppNotification(db, {
      userId: resume.ownerUserId,
      type: "RESUME_ANALYSIS_COMPLETED",
      payload: {
        title: "Resume analysis complete",
        message: "Your ATS report is ready to review in Resume Hub.",
        screen: "resume",
        resumeId: resume.id,
      },
    });
    return { status: "completed" as const, jobId: job.id, resumeId: resume.id, notificationId: notification.id };
  } catch (error) {
    console.error("resume.worker.failed", { jobId: job.id, resumeId: resume.id, error });
    return failOrRetryResumeJob({
      jobId: job.id,
      analysisId: analysis.id,
      resumeId: resume.id,
      userId: resume.ownerUserId,
      attempts: job.attempts,
      error,
    });
  }
}

async function processMediaDeleteJobs(limit: number) {
  let completed = 0;
  for (let index = 0; index < limit; index += 1) {
    const job = await claimNextJob(["MEDIA_DELETE", "RETENTION_MEDIA_DELETE"]);
    if (!job) break;
    const payload = mediaDeletePayload.safeParse(job.payload);
    if (!payload.success) {
      await db.job.update({ where: { id: job.id }, data: { status: "failed", lockedAt: null, completedAt: new Date(), lastError: "INVALID_MEDIA_DELETE_PAYLOAD" } });
      continue;
    }
    try {
      await deletePrivateObject(payload.data.storageKey);
      await db.job.update({ where: { id: job.id }, data: { status: "completed", lockedAt: null, completedAt: new Date(), lastError: null } });
      await db.mediaAsset.updateMany({ where: { id: payload.data.mediaAssetId }, data: { status: "DELETED", deletedAt: new Date() } });
      completed += 1;
    } catch (error) {
      await db.job.update({
        where: { id: job.id },
        data: { status: "queued", lockedAt: null, runAfter: new Date(Date.now() + 300_000), lastError: "MEDIA_DELETE_FAILED" },
      });
      console.error("media.delete.worker_failed", error);
    }
  }
  return completed;
}

export async function runRetentionCleanup() {
  const expired = await db.resume.findMany({
    where: { deletedAt: null, retentionUntil: { lte: new Date() } },
    include: { mediaAsset: true },
    take: configuredInteger("RETENTION_CLEANUP_BATCH_SIZE", 50, 1, 500),
  });
  let queued = 0;
  for (const resume of expired) {
    const idempotencyKey = `retention-media-delete:${resume.mediaAssetId}`;
    await db.resume.update({ where: { id: resume.id }, data: { status: "DELETED", deletedAt: new Date(), extractedText: null } });
    await db.resumeAnalysis.deleteMany({ where: { resumeId: resume.id } });
    await db.mediaAsset.update({ where: { id: resume.mediaAssetId }, data: { status: "DELETED", deletedAt: new Date(), deletionReason: "RETENTION_EXPIRED" } });
    await db.job.upsert({
      where: { idempotencyKey },
      update: { status: "queued", runAfter: new Date(), lockedAt: null },
      create: {
        type: "RETENTION_MEDIA_DELETE",
        payload: { mediaAssetId: resume.mediaAssetId, storageKey: resume.mediaAsset.storageKey },
        idempotencyKey,
        status: "queued",
      },
    });
    queued += 1;
  }

  const deleted = await processMediaDeleteJobs(configuredInteger("RETENTION_CLEANUP_BATCH_SIZE", 50, 1, 500));
  return { expired: expired.length, queued, deleted };
}
