import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { getCurrentUser, revokeCurrentSession } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);

  const existing = await db.dataRequest.findFirst({
    where: { subjectUserId: user.id, requestType: "DELETION", status: { in: ["REQUESTED", "PROCESSING"] } },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return jsonData({ requestId: existing.id, status: existing.status.toLowerCase(), dueAt: existing.dueAt });

  const requestedAt = new Date();
  const dueAt = new Date(requestedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  const request = await db.dataRequest.create({
    data: {
      requestedById: user.id,
      subjectUserId: user.id,
      requestType: "DELETION",
      dueAt,
    },
  });

  await db.user.update({ where: { id: user.id }, data: { status: "DELETED", deletedAt: requestedAt } });
  await db.job.create({
    data: {
      type: "DATA_DELETION",
      payload: { requestId: request.id, subjectUserId: user.id },
      idempotencyKey: `data-deletion:${request.id}`,
      createdById: user.id,
    },
  });

  await revokeCurrentSession();
  return jsonData({ requestId: request.id, status: "requested", dueAt }, 202);
}
