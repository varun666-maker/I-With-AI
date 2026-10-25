import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";

export const runtime = "nodejs";

function addBusinessDays(start: Date, days: number) {
  const result = new Date(start);
  let remaining = days;
  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + 1);
    const day = result.getUTCDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return result;
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);

  const existing = await db.dataRequest.findFirst({
    where: { subjectUserId: user.id, requestedById: user.id, requestType: "EXPORT", status: { in: ["REQUESTED", "PROCESSING"] } },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return jsonData({ requestId: existing.id, status: existing.status.toLowerCase(), dueAt: existing.dueAt });

  const requestedAt = new Date();
  const dueAt = addBusinessDays(requestedAt, 7);
  const request = await db.dataRequest.create({
    data: {
      requestedById: user.id,
      subjectUserId: user.id,
      requestType: "EXPORT",
      dueAt,
    },
  });

  await db.job.create({
    data: {
      type: "DATA_EXPORT",
      payload: { requestId: request.id, subjectUserId: user.id },
      idempotencyKey: `data-export:${request.id}`,
      createdById: user.id,
    },
  });

  return jsonData({ requestId: request.id, status: "requested", dueAt }, 202);
}
