import { jsonData, jsonError } from "@/lib/server/api";
import { runRetentionCleanup } from "@/lib/server/resume-worker";
import { isAuthorizedWorker } from "@/lib/server/worker-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!process.env.JOB_WORKER_SECRET) return jsonError("WORKER_NOT_CONFIGURED", "The worker secret is not configured.", 503);
  if (!isAuthorizedWorker(request)) return jsonError("FORBIDDEN", "Worker authorization is required.", 403);

  try {
    return jsonData(await runRetentionCleanup());
  } catch (error) {
    console.error("retention.cleanup.request_failed", error);
    return jsonError("CLEANUP_FAILED", "Retention cleanup could not complete this run.", 500);
  }
}
