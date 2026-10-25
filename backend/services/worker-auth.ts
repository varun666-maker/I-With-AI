import { timingSafeEqual } from "node:crypto";

export function isAuthorizedWorker(request: Request) {
  const secret = process.env.JOB_WORKER_SECRET;
  if (!secret) return false;
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : request.headers.get("x-worker-secret") ?? "";
  const expected = Buffer.from(secret);
  const actual = Buffer.from(supplied);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
