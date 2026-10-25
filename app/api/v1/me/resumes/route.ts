import { createHash, randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";
import { RESUME_ANALYSIS_PROMPT_VERSION } from "@/lib/server/resume-analysis";
import { configuredLimit, rejectUntrustedOrigin } from "@/lib/server/request-security";
import { uploadPrivateResume } from "@/lib/server/storage";

export const runtime = "nodejs";

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "docx"]);
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream",
]);

function maxResumeBytes() {
  const configured = Number(process.env.RESUME_MAX_BYTES ?? DEFAULT_MAX_BYTES);
  return Number.isSafeInteger(configured) && configured > 0 ? configured : DEFAULT_MAX_BYTES;
}

function safeFileName(fileName: string) {
  const normalized = fileName.replaceAll("\\", "/").split("/").pop() ?? "resume";
  return normalized.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180) || "resume";
}

function fileExtension(fileName: string) {
  return fileName.toLowerCase().split(".").pop() ?? "";
}

function hasExpectedSignature(extension: string, buffer: Buffer) {
  if (extension === "pdf") return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  return buffer.subarray(0, 4).toString("hex") === "504b0304";
}

function serializeResume(resume: {
  id: string;
  fileName: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  retentionUntil: Date | null;
  mediaAsset: { mimeType: string; sizeBytes: bigint };
  analyses?: Array<{
    id: string;
    status: string;
    atsScore: number | null;
    overallScore: number | null;
    jobFitScore: number | null;
    completedAt: Date | null;
  }>;
}) {
  const analysis = resume.analyses?.[0] ?? null;
  return {
    id: resume.id,
    fileName: resume.fileName,
    status: resume.status,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
    retentionUntil: resume.retentionUntil,
    mimeType: resume.mediaAsset.mimeType,
    sizeBytes: Number(resume.mediaAsset.sizeBytes),
    analysis: analysis
      ? {
          id: analysis.id,
          status: analysis.status,
          atsScore: analysis.atsScore,
          overallScore: analysis.overallScore,
          jobFitScore: analysis.jobFitScore,
          completedAt: analysis.completedAt,
        }
      : null,
  };
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);

    const resumes = await db.resume.findMany({
      where: { ownerUserId: user.id, deletedAt: null },
      include: {
        mediaAsset: { select: { mimeType: true, sizeBytes: true } },
        analyses: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            atsScore: true,
            overallScore: true,
            jobFitScore: true,
            completedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonData({ resumes: resumes.map(serializeResume) });
  } catch (error) {
    console.error("resume.history.database_failed", error);
    return jsonError("RESUME_SERVICE_UNAVAILABLE", "Resume history is temporarily unavailable. Please retry shortly.", 503);
  }
}

export async function POST(request: Request) {
  const originError = rejectUntrustedOrigin(request);
  if (originError) return originError;

  try {
  const user = await getCurrentUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);

  const maxBytes = maxResumeBytes();
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxBytes + 256 * 1024) {
    return jsonError("REQUEST_TOO_LARGE", "The upload request is too large.", 413);
  }

  const recentUploadCount = await db.resume.count({
    where: {
      ownerUserId: user.id,
      deletedAt: null,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recentUploadCount >= configuredLimit("RESUME_UPLOADS_PER_HOUR", 25, 1, 100)) {
    return jsonError("UPLOAD_RATE_LIMITED", "Resume upload limit reached. Try again later.", 429);
  }

  const activeProcessingCount = await db.resume.count({
    where: {
      ownerUserId: user.id,
      deletedAt: null,
      status: "PROCESSING",
      updatedAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
    },
  });
  if (activeProcessingCount >= configuredLimit("RESUME_ACTIVE_LIMIT", 5, 1, 20)) {
    return jsonError("ACTIVE_RESUME_LIMIT", "An analysis is already in progress. Please wait for it to finish.", 429);
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) return jsonError("FILE_REQUIRED", "Choose a PDF or DOCX resume.", 400);

  const fileName = safeFileName(file.name);
  const extension = fileExtension(fileName);
  if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.type || "application/octet-stream")) {
    return jsonError("UNSUPPORTED_FILE", "Only PDF and DOCX resumes are supported.", 415);
  }
  if (file.size === 0 || file.size > maxBytes) {
    return jsonError("FILE_TOO_LARGE", "Resume files must be larger than 0 bytes and no larger than 5 MB.", 413);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasExpectedSignature(extension, buffer)) {
    return jsonError("INVALID_FILE", "The uploaded file does not match its extension.", 400);
  }

  const resumeId = randomUUID();
  const mediaAssetId = randomUUID();
  const checksum = createHash("sha256").update(buffer).digest("hex");
  const retentionDays = Number(process.env.PREP_RESUME_RETENTION_DAYS ?? "30");
  const retentionUntil = new Date(Date.now() + (Number.isFinite(retentionDays) ? retentionDays : 30) * 24 * 60 * 60 * 1000);
  const mimeType = file.type || (extension === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

  let storage: { storageKey: string; storageProvider: string };
  try {
    storage = await uploadPrivateResume({ userId: user.id, resumeId, fileName, mimeType, buffer });
  } catch (error) {
    console.error("resume.upload.storage_failed", error);
    return jsonError("STORAGE_UNAVAILABLE", "Private resume storage is temporarily unavailable. Please try again.", 503);
  }

  try {
    const mediaAsset = await db.mediaAsset.create({
      data: {
        id: mediaAssetId,
        ownerUserId: user.id,
        assetType: "resume",
        storageProvider: storage.storageProvider,
        storageKey: storage.storageKey,
        mimeType,
        sizeBytes: BigInt(file.size),
        checksum,
        status: "READY",
        retentionUntil,
      },
    });
    const resume = await db.resume.create({
      data: {
        id: resumeId,
        ownerUserId: user.id,
        mediaAssetId: mediaAsset.id,
        fileName,
        status: "UPLOADED",
        retentionUntil,
      },
      include: { mediaAsset: { select: { mimeType: true, sizeBytes: true } } },
    });
    const analysis = await db.resumeAnalysis.create({
      data: {
        resumeId,
        provider: "gemini",
        model: process.env.GEMINI_RESUME_MODEL ?? "gemini-3-flash-preview",
        promptVersion: RESUME_ANALYSIS_PROMPT_VERSION,
        status: "QUEUED",
      },
    });
    await db.job.create({
      data: {
        type: "RESUME_ANALYSIS",
        payload: { resumeId, userId: user.id, mediaAssetId, analysisId: analysis.id },
        idempotencyKey: `resume-analysis:${resumeId}`,
        status: "queued",
        createdById: user.id,
      },
    });
    await db.auditLog.create({
      data: {
        actorUserId: user.id,
        actorRole: user.role,
        action: "RESUME_UPLOADED",
        entityType: "RESUME",
        entityId: resumeId,
        details: { mimeType, sizeBytes: file.size, analysisQueued: true },
      },
    });

    return jsonData({ resume: serializeResume(resume), analysisQueued: true }, 201);
  } catch (error) {
    console.error("resume.upload.database_failed", error);
    try {
      const { deletePrivateObject } = await import("@/lib/server/storage");
      await deletePrivateObject(storage.storageKey);
    } catch (cleanupError) {
      console.error("resume.upload.cleanup_failed", cleanupError);
    }
    return jsonError("RESUME_SERVICE_UNAVAILABLE", "Resume upload is temporarily unavailable. Please retry shortly.", 503);
  }
  } catch (error) {
    console.error("resume.upload.request_failed", error);
    return jsonError("RESUME_SERVICE_UNAVAILABLE", "Resume upload is temporarily unavailable. Please retry shortly.", 503);
  }
}
