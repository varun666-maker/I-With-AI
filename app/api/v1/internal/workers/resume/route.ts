import { jsonData, jsonError } from "@/lib/server/api";
import { isAuthorizedWorker } from "@/lib/server/worker-auth";
import { processNextResumeJob } from "@/lib/server/resume-worker";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!process.env.JOB_WORKER_SECRET) return jsonError("WORKER_NOT_CONFIGURED", "The worker secret is not configured.", 503);
  if (!isAuthorizedWorker(request)) return jsonError("FORBIDDEN", "Worker authorization is required.", 403);

  try {
    return jsonData(await processNextResumeJob());
  } catch (error) {
    console.error("resume.worker.request_failed", error);
    return jsonError("WORKER_FAILED", "The resume worker could not complete this run.", 500);
  }
}
